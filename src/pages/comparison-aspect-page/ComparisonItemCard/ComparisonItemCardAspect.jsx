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
  return (
    <div className="relative">
      {!userVoted && <VotingAnimation onVote={onVoteCasted} />}
      {userVoted ? (
        <VotedCard
          item={item}
          handleRevertClick={handleRevertClick}
          totalVotes={totalVotes}
          isVotedItem={isVotedItem}
          userVoted={userVoted}
        />
      ) : (
        <NotVotedCard
          item={item}
        />
      )}
    </div>
  );
};

export default ComparisonItemCardAspect; 