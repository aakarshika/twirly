import React from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ComparisonItemCardAspect from '../comparison-aspect-page/ComparisonItemCard/ComparisonItemCardAspect';
import ComparisonSetAspectsCommentsSection from '../comparison-aspect-page/ComparisonSetAspectsCommentsSection';
import { useComparisonAspectData } from '../../hooks/useComparisonAspectData';

const CompareAspectView = ({ onVoteChange }) => {
  const { aspectId } = useParams();
  const { currentTheme } = useTheme();
  
  const {
    loading,
    error,
    currentSet,
    currentAspectSet,
    items,
    totalVotes,
    userVoted,
    votedItemId,
    handleVote,
    handleRevertVote,
  } = useComparisonAspectData(aspectId);

  // Wrap the vote handlers to notify parent
  const handleVoteWithUpdate = async (itemId) => {
    console.log('CompareAspectView: handleVoteWithUpdate called with itemId:', itemId);
    const success = await handleVote(itemId);
    console.log('CompareAspectView: handleVote success:', success);
    if (success) {
      console.log('CompareAspectView: calling onVoteChange with aspectId:', aspectId);
      onVoteChange(aspectId, true);
    }
  };

  const handleRevertVoteWithUpdate = async () => {
    console.log('CompareAspectView: handleRevertVoteWithUpdate called');
    const success = await handleRevertVote();
    console.log('CompareAspectView: handleRevertVote success:', success);
    if (success) {
      console.log('CompareAspectView: calling onVoteChange with aspectId:', aspectId);
      onVoteChange(aspectId, false);
    }
  };

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

  return (
    <div className="flex flex-col">
      <div className="shadow-md rounded-md p-4 mobile-friendly-margin-bottom"
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
                  item={item}
                  index={i}
                  height="100"
                  totalVotes={totalVotes}
                  userVoted={userVoted}
                  votedItemId={votedItemId}
                  handleVote={handleVoteWithUpdate}
                  handleRevertVote={handleRevertVoteWithUpdate}
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
          />
        </div>
        <span className="text-2xl animate-bounce">. . .</span>
      </div>
    </div>
  );
};

export default CompareAspectView; 