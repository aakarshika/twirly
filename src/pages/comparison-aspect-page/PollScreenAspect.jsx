import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useHeader } from '../../contexts/HeaderContext';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import ComparisonItemCardAspect from './ComparisonItemCard/ComparisonItemCardAspect';
import { splitAndJoin } from '../../lib/utils';
import { usePollScreenAspect } from '../../hooks/usePollScreenAspect';
import './PollScreenAspect.css';
import ComparisonSetAspectsCommentsSection from './ComparisonSetAspectsCommentsSection';

// Add Google Fonts
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap');
`;

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
    nextCardData,
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
    <>
      <style>{fontStyles}</style>
      <div className="min-h-screen h-full flex flex-col max-w-4xl mx-auto font-outfit"
        style={{
          paddingTop: isHeaderVisible ? '64px' : '0px',
          paddingBottom: '80px'
        }}>

        <div className="h-full flex flex-col animate-fadeIn" {...handlers}>
          <div className="">
            <div className="space-y-4">
              <div className={`shadow-md rounded-md p-4 mobile-friendly-margin-bottom 
                ${showStartAnimation ? 'vote-animation' : showEndAnimation ? 'vote-animation-reverse' : ''}`}
                style={{
                  backgroundColor: currentTheme.colors.card,
                  transform: 'translateY(0)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}>
                <div style={{ color: currentTheme.colors.text }}>
                  <div className="flex items-center justify-center">
                    <span style={{ color: currentTheme.colors.primary }} className="text-sm font-bold text-center font-space-grotesk tracking-wide">
                      {currentSet?.name || 'Untitled Comparison'}
                    </span>
                  </div>


                  <div className="flex justify-between">
                    <button
                      onClick={handlePreviousNavigation}
                      className=" z-20 w-10 h-10 justify-center  rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                      style={{ backgroundColor: 'gray' }}
                    >
                      <div className="flex items-center justify-center">  
                        <ChevronLeft size={20} style={{ color: 'white' }} />
                      </div>
                    </button>

                    <div className="" >
                      <span className="text-sm font-medium text-white tracking-wide" style={{ color: currentTheme.colors.disabled }} >
                        Base your vote on
                      </span>
                      <div className="rounded-full m-2 px-4 py-1 animate-pulse" style={{ backgroundColor: currentTheme.colors.primary }}>
                        <span className="text-md font-medium tracking-wide" style={{ color: 'white' }} >
                          {splitAndJoin(currentAspectSet?.metric_name)}
                        </span>
                      </div>
                    </div>
                    {nextCardData && (
                      <button
                        onClick={handleNextNavigation}
                        className="right-1 z-20 w-10 h-10 justify-center  rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      >
                        <div className="flex items-center justify-center">
                          <ChevronRight size={20} style={{ color: 'white' }} />
                        </div>
                      </button>
                    )}
                    {!nextCardData && userVoted && (
                      <button
                        onClick={handleNextNavigation}
                        className="flex-row right-1 z-20 w-auto h-10 px-4 justify-center  rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                        style={{ backgroundColor: 'rgba(212, 167, 32, 0.82)' }}
                      >
                        <div className="flex flex-row items-center justify-center">
                          <Trophy size={20} style={{ color: 'white' }} />  
                        </div>
                      </button>
                    )}
                    {!nextCardData && !userVoted && (
                      <button
                        onClick={handleNextNavigation}
                        className="flex-row right-1 z-20 w-auto h-10 px-4 justify-center  rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                        style={{ backgroundColor: 'rgba(209, 208, 206, 0.82)' }}
                      >
                        <div className="flex flex-row items-center justify-center">
                          <Trophy size={20} style={{ color: 'white' }} />  
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className={`grid ${items.length === 1 ? 'grid-cols-1' :
                    items.length === 2 ? 'grid-cols-2' :
                      items.length % 3 === 0 ? 'grid-cols-3' :
                        'grid-cols-2'
                    }`}
                    style={{
                      gap: '1vh'
                    }}
                  >
                    {items.map((item, i) => (
                      <div key={item.id} className="transform transition-all duration-300 hover:scale-105">
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
              <div className="text-center animate-fadeIn" style={{ backgroundColor: 'white' }}>
                <div className="w-full" style={{ marginBottom: '300px' }}>
                  <ComparisonSetAspectsCommentsSection
                    userVoted={userVoted}
                    aspectSetId={id}
                    items={items}
                    aspectSet={currentAspectSet}
                    handleLikeComparisonAspectSet={handleLikeComparisonAspectSet}
                  />
                </div>
                <span className="text-2xl animate-bounce" >. . .</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default PollScreenAspect; 