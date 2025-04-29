import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useHeader } from '../contexts/HeaderContext';
import PollGrid from '../components/comparison/PollGrid';
import BarChart from '../components/results/visualizations/BarChart';
import ComparisonSetCommentsSection from '../components/comparison/ComparisonSetCommentsSection';
import Button from '../components/common/Button';
import { ArrowRight, MessageSquare, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ComparisonGridSkeleton from '../components/skeletons/ComparisonGridSkeleton';
import ComparisonItemCardAspect from '../components/comparison/ComparisonItemCard/ComparisonItemCardAspect';
import { splitAndJoin } from '../lib/utils';
import { useComparisonAspectDetails } from '../hooks/useComparisonAspectDetails';

const PollScreenAspect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const {
    items,
    currentSet,
    currentAspectSet,
    totalVotes,
    userVoted,
    votedItemId,
    handleVote,
    handleRevertVote,
    itemReviews,
    loading,
    error } = useComparisonAspectDetails(id);

  useEffect(() => {
    setHeight('100vh');
  });

  const [height, setHeight] = useState('100vh');

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
        <ComparisonGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure itemReviews is properly structured
  const processedItemReviews = itemReviews || {};

  return (
    <div className="min-h-screen h-full flex flex-col max-w-4xl mx-auto"
      style={{
        backgroundColor: currentTheme.colors.background,
        top: isHeaderVisible ? '64px' : '0px',
      }}>
      <div className="h-full flex flex-col max-w-4xl mx-auto">
        <div className="flex-1">

          <div className="space-y-4 m-4" style={{ color: currentTheme.colors.primary }}>
            <div className="shadow-md rounded-md p-4" style={{ backgroundColor: currentTheme.colors.card }}>
              <div style={{ color: currentTheme.colors.text }}>
                <div className="" >
                  <div className="rounded-full gap-2 m-2 px-4 py-1 w-fit" style={{ backgroundColor: currentTheme.colors.primary }}>
                    <span className="text-sm" style={{ color: currentTheme.colors.card }}>Who is the most </span>
                    <span className="text-bold " style={{ color: 'white' }} >
                      {splitAndJoin(currentAspectSet?.metric_name)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center m-4">
                  <span style={{ color: currentTheme.colors.primary }} className="text-md font-bold text-center">
                    {currentSet?.name || 'Untitled Comparison'}
                  </span>
                </div>

              </div>
              <div className={`grid ${
                  items.length === 1 ? 'grid-cols-1' :
                  items.length === 2 ? 'grid-cols-2' :
                  items.length === 3 ? 'grid-cols-3' :
                  'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`} 
                style={{
                  gap: '0vh'
                }}
              >
                {items.map((item, i) => (
                  <div key={item.id}>
                    <ComparisonItemCardAspect
                      key={item.id}
                      item={item.items}
                      index={i}
                      height={height}
                      totalVotes={totalVotes}
                      itemReviews={processedItemReviews}
                      userVoted={userVoted}
                      votedItemId={votedItemId}
                      handleVote={handleVote}
                      handleRevertVote={handleRevertVote}
                    />
                  </div>
                ))}
              </div>
            </div>
                
                <button
                      onClick={() => navigate('/comparison/' + currentAspectSet.set_id)}
                      className=" w-full pull-right rounded-md "
                    >
                      <span className="flex items-center gap-2">Go To Comparison Page
                      <ArrowRight size={16} /></span>
                    </button>
          </div>
          <div className="text-center m-4" style={{ color: currentTheme.colors.text, backgroundColor: 'white', borderRadius: '4px' }}>
            <div className="w-full p-4">
              <ComparisonSetCommentsSection setId={id} items={items} aspectSet={currentAspectSet} />
            </div>
          </div>
        </div>
{/* Navigation Buttons, needs to be fixed to be on the bottom of the screen. should not move when scrolled.  */}
        <div className="flex flex-row fixed bottom-0 right-0 justify-between text-center m-4 z-10">
              <button
                onClick={() => navigate('/comparison-aspect/' + (parseInt(id) - 1).toString())}
                className="px-4 py-2 bg-gray-400 text-white rounded-full font-semibold hover:bg-amber-300 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => navigate('/comparison-aspect/' + (parseInt(id) + 1).toString())}
                style={{ backgroundColor: currentTheme.colors.primary }}
                className="flex flex-row items-center gap-2 px-4 py-2 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-300 transition-colors"
              >
                Next
                <ArrowRight size={16} />
              </button>
          </div>
      </div>
    </div>
  );
};

export default PollScreenAspect; 