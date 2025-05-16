import React from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ComparisonItemCardAspect from '../comparison-aspect-page/ComparisonItemCard/ComparisonItemCardAspect';
import ComparisonSetAspectsCommentsSection from '../comparison-aspect-page/ComparisonSetAspectsCommentsSection';
import { usePollScreenAspect } from '../../hooks/usePollScreenAspect';

const CompareAspectView = () => {
  const { id, aspectId } = useParams();
  const { currentTheme } = useTheme();
  
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
  } = usePollScreenAspect(aspectId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  const processedItemReviews = itemReviews || {};

  return (
    <div className="flex flex-col">
      <div className="shadow-md rounded-md p-4 mobile-friendly-margin-bottom 
        ${showStartAnimation ? 'vote-animation' : showEndAnimation ? 'vote-animation-reverse' : ''}"
        style={{
          backgroundColor: currentTheme.colors.card,
          transform: 'translateY(0)',
          transition: 'transform 0.3s ease-in-out',
        }}>
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

      <div className="text-center animate-fadeIn" style={{ backgroundColor: 'white' }}>
        <div className="w-full" style={{ marginBottom: '300px' }}>
          <ComparisonSetAspectsCommentsSection
            userVoted={userVoted}
            aspectSetId={aspectId}
            items={items}
            aspectSet={currentAspectSet}
            handleLikeComparisonAspectSet={handleLikeComparisonAspectSet}
          />
        </div>
        <span className="text-2xl animate-bounce">. . .</span>
      </div>
    </div>
  );
};

export default CompareAspectView; 