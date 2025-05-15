import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useHeader } from '../../contexts/HeaderContext';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ComparisonItemCardAspect from './ComparisonItemCard/ComparisonItemCardAspect';
import { splitAndJoin } from '../../lib/utils';
import { usePollScreenAspect } from '../../hooks/usePollScreenAspect';
import './PollScreenAspect.css';
import ComparisonSetAspectsCommentsSection from './ComparisonSetAspectsCommentsSection';

const PollScreenAspect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();

  const {
    showStartAnimation,
    showEndAnimation,
    height,
    items,
    currentSet,
    currentAspectSet,
    totalVotes,
    userVoted,
    votedItemId,
    itemReviews,
    loading,
    error,
    handleVote,
    handleRevertVote,
    handleLikeComparisonAspectSet,
    handlePreviousNavigation,
    handleNextNavigation,
  } = usePollScreenAspect(id);

  const handlers = useSwipeable({
    onSwipedLeft: handleNextNavigation,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 10,
    swipeDuration: 500,
    touchEventOptions: { passive: false },
    trackTouch: true,
    rotationAngle: 0,
  });

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

  const processedItemReviews = itemReviews || {};

  return (
    <div className="min-h-screen h-full flex flex-col max-w-4xl mx-auto"
      style={{
        paddingTop: isHeaderVisible ? '64px' : '0px',
        paddingBottom: '80px'
      }}>

      <div className="h-full flex flex-col " {...handlers}>
        <div className="">
          <div className="space-y-4">
            <div className={`shadow-md rounded-md p-4 mobile-friendly-margin-bottom 
              ${showStartAnimation ? 'vote-animation' : showEndAnimation ? 'vote-animation-reverse' : ''}`} 
              style={{ backgroundColor: currentTheme.colors.card }}>

              <div style={{ color: currentTheme.colors.text }}>
                <div className="flex items-center justify-center m-4">
                  <span style={{ color: currentTheme.colors.primary }} className="text-md font-bold text-center">
                    {currentSet?.name || 'Untitled Comparison'}
                  </span>
                </div>
                <div className="flex justify-center" >
                  <div className="rounded-full m-2 px-4 py-1" style={{ backgroundColor: currentTheme.colors.primary }}>
                    <span className="text-md " style={{ color: 'white' }} >
                      {splitAndJoin(currentAspectSet?.metric_name)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className={`grid ${items.length === 1 ? 'grid-cols-1' :
                  items.length === 2 ? 'grid-cols-2' :
                    items.length%3 === 0 ? 'grid-cols-3' :
                      'grid-cols-2'
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
            <div className="text-center m-1" style={{ backgroundColor: 'white', borderRadius: '4px' }}>
              <div className="w-full p-4" style={{ marginBottom: '300px' }}>
                <ComparisonSetAspectsCommentsSection 
                  userVoted={userVoted} 
                  aspectSetId={id} 
                  items={items} 
                  aspectSet={currentAspectSet}
                  handleLikeComparisonAspectSet={handleLikeComparisonAspectSet}
                />
              </div>
              <span className="text-2xl" >. . .</span>
            </div>
          )}
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 z-10">
        <button
          onClick={handlePreviousNavigation}
          className="absolute left-1 z-20 p-2 rounded-full shadow-lg"
          style={{ backgroundColor: 'gray', marginTop: '90%' }}
        >
          <ChevronLeft size={24} style={{ color: 'white' }} />
        </button>
        <button
          onClick={handleNextNavigation}
          className="absolute right-1 z-20 p-2 rounded-full shadow-lg"
          style={{ backgroundColor: currentTheme.colors.primary, marginTop: '90%' }}
        >
          <ChevronRight size={24} style={{ color: 'white' }} />
        </button>
      </div>
    </div>
  );
};

export default PollScreenAspect; 