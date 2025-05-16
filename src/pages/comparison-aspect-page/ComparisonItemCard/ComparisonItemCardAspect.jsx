import React from 'react';
import VotedCard from './VotedCard';
import NotVotedCard from './NotVotedCard';
import VotingAnimation from './VotingAnimation/VotingAnimation';
import { useComparisonItemCardAspect } from '../../../hooks/useComparisonItemCardAspect';
import './ComparisonItemCard.css';

const ComparisonItemCardAspect = ({
  item,
  index,
  height,
  userVoted,
  handleVote,
  handleRevertVote,
  votedItemId,
  totalVotes,
  itemReviews
}) => {
  const {
    imageError,
    showStartAnimation,
    isVotedItem,
    itemReviewData,
    reviewCount,
    handleItemClick,
    onVoteCasted,
    handleRevertClick
  } = useComparisonItemCardAspect({
    item,
    userVoted,
    handleVote,
    handleRevertVote,
    votedItemId,
    totalVotes,
    itemReviews
  });

  const numericHeight = parseFloat('100');
  const newHeight = (numericHeight*2 / 6) + 'vh';

  return (
    <div className="relative">
      {!userVoted && <VotingAnimation onVote={onVoteCasted} />}
      {userVoted ? (
        <VotedCard
          item={item}
          newHeight={newHeight}
          handleRevertClick={handleRevertClick}
          handleItemClick={handleItemClick}
          totalVotes={totalVotes}
          itemReviewData={itemReviewData}
          reviewCount={reviewCount}
          isVotedItem={isVotedItem}
        />
      ) : (
        <NotVotedCard
          item={item}
          newHeight={newHeight}
          handleItemClick={handleItemClick}
        />
      )}
    </div>
  );
};

export default ComparisonItemCardAspect; 