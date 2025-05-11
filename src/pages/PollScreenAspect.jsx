import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useHeader } from '../contexts/HeaderContext';
import { useSwipeable } from 'react-swipeable';
import PollGrid from '../components/comparison/PollGrid';
import Button from '../components/common/Button';
import { ArrowRight, MessageSquare, Star, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ComparisonItemCardAspect from '../components/comparison/ComparisonItemCard/ComparisonItemCardAspect';
import { splitAndJoin } from '../lib/utils';
import { useComparisonAspectDetails } from '../hooks/useComparisonAspectDetails';
import './PollScreenAspect.css';
import ComparisonSetAspectsCommentsSection from '../components/comparison/ComparisonSetAspectsCommentsSection';

const PollScreenAspect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const [showStartAnimation, setShowStartAnimation] = useState(true);
  const [showEndAnimation, setShowEndAnimation] = useState(false);
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
    error,
    fetchComparisonDetails,
    handleLikeComparisonAspectSet
  } = useComparisonAspectDetails(id);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      handleNextNavigation()
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 10,
    swipeDuration: 500,
    touchEventOptions: { passive: false },
    trackTouch: true,
    rotationAngle: 0,
  });

  useEffect(() => {
    console.log('id', id);
    setShowStartAnimation(true);
    if (id) {
      fetchComparisonDetails();
    }
    const timer = setTimeout(() => {
      setShowStartAnimation(false);
    }, 500); // Match this with the animation duration
    return () => clearTimeout(timer);
  }, [id]);
  useEffect(() => {
    setHeight('100vh');
  });

  const [height, setHeight] = useState('100vh');

  const handleNextNavigation = () => {
    setShowEndAnimation(true);
    const timer = setTimeout(() => {
      setShowEndAnimation(false);
      navigate('/comparison-aspect/' + (parseInt(id) + 1).toString());
      return () => clearTimeout(timer);
  }, 350);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
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
        paddingTop: isHeaderVisible ? '44px' : '0px',
        paddingBottom: '80px',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        perspective: '1000',
        WebkitPerspective: '1000',
        transformStyle: 'preserve-3d',
        WebkitTransformStyle: 'preserve-3d'
      }}>

      <div className="h-full items-end">
        <button
          onClick={handleNextNavigation}
          className="absolute right-1 z-10 p-2 rounded-full shadow-lg "
          style={{ backgroundColor: currentTheme.colors.primary, marginTop: '90%' }}
        >
          <ChevronRight size={24} style={{ color: 'white' }} />
        </button>
      </div>
      <div className="h-full flex flex-col max-w-4xl mx-auto" {...handlers}>
        <div className="">
          <div className="space-y-4 " style={{ color: currentTheme.colors.primary }}>


            <div className={`shadow-md rounded-md p-4 mobile-friendly-margin-bottom 
              ${showStartAnimation ? 'vote-animation' : showEndAnimation ? 'vote-animation-reverse' : ''}`} 
              style={{ backgroundColor: currentTheme.colors.card }}>

              <div style={{ color: currentTheme.colors.text }}>
                <div className="flex items-center justify-center m-4">
                  <span style={{ color: currentTheme.colors.primary }} className="text-md font-bold text-center">
                    {currentSet?.name || 'Untitled Comparison'}
                  </span>
                </div>
                <div className="" >
                  <div className="rounded-full gap-2 m-2 px-4 py-1 w-full" style={{ backgroundColor: currentTheme.colors.primary }}>
                    {/* <span className="text-sm" style={{ color: currentTheme.colors.card }}>Vote for the most </span> */}
                    <span className="text-md " style={{ color: 'white' }} >
                      {splitAndJoin(currentAspectSet?.metric_name)}
                    </span>
                  </div>
                </div>

              </div>
              <div>
                <div className={`grid ${items.length === 1 ? 'grid-cols-1' :
                  items.length === 2 ? 'grid-cols-2' :
                    items.length === 3 ? 'grid-cols-3' :
                      'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  }`}
                  style={{
                    gap: '1vh'
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
            </div>
          </div>
          {(
            <div className="text-center m-1" style={{ color: currentTheme.colors.text, backgroundColor: 'white', borderRadius: '4px' }}>
              <div className="w-full p-4">
                <ComparisonSetAspectsCommentsSection 
                userVoted={userVoted} 
                aspectSetId={id} 
                items={items} 
                aspectSet={currentAspectSet}
                handleLikeComparisonAspectSet={handleLikeComparisonAspectSet}
                />
              </div>
              <span className="text-2xl">. . .</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollScreenAspect; 