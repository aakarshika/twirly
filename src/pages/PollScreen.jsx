import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useComparison } from '../contexts/ComparisonContext';
import PollGrid from '../components/comparison/PollGrid';
import BarChart from '../components/results/visualizations/BarChart';
import ComparisonSetCommentsSection from '../components/comparison/ComparisonSetCommentsSection';
import { useComparisonDetails } from '../hooks/useComparisonDetails';

const PollScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    items, 
    userVoted, 
    votedItemId, 
    currentSetId 
  } = useComparison();
  const { currentTheme } = useTheme();
  const [comparisonName, setComparisonName] = useState('');
  const { loading, error, nextPollId } = useComparisonDetails(id);

  useEffect(() => {
    if (items.length > 0 && items[0].category) {
      setComparisonName(items[0].category);
    }
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
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

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: currentTheme.colors.background }}>
      <PollGrid 
        title={comparisonName}
        items={items}
        votedItemId={votedItemId}
        userVoted={userVoted}
        nextPollId={nextPollId}
      />

      <div 
        className="relative z-0 w-full"
        style={{ 
          marginTop: '100vh',
          minHeight: '100vh',
          backgroundColor: currentTheme.colors.background,
          transform: 'translateZ(0)'
        }}
      >
        <div className="w-full max-w-4xl mx-auto">
          <div className="w-full p-4">
            <div className="bg-gray-800 rounded-lg p-4" style={{ backgroundColor: currentTheme.colors.background }}>
              <BarChart items={items} />
            </div>
          </div>

          <div className="w-full p-4">
            <ComparisonSetCommentsSection setId={currentSetId} items={items} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollScreen; 