import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import VotedCard from './VotedCard';
import NotVotedCard from './NotVotedCard';
import VotingAnimation from './VotingAnimation/VotingAnimation';
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
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [imageError, setImageError] = useState(true);
  const [showStartAnimation, setShowStartAnimation] = useState(false);

  // Check if image exists and is valid
  useEffect(() => {
    if (!item.image_url) {
      setImageError(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
    };
    img.src = item.image_url;
  }, [item.image_url]);

  // Add effect to handle animation when userVoted changes
  useEffect(() => {
    setShowStartAnimation(true);
    const timer = setTimeout(() => {
      setShowStartAnimation(false);
    }, 500); 
    return () => clearTimeout(timer);
  }, [userVoted]);

  const handleItemClick = (e) => {
    navigate(`/item/${item.id}`);
  };

  const onVoteCasted = (e) => {
    if (userVoted) return;
    handleVote(item.id);
  };

  const handleRevertClick = (e) => {
    handleRevertVote();
  };

  const isVotedItem = userVoted && votedItemId === item.id;
  
  // Properly handle itemReviews data
  const itemReviewData = itemReviews && itemReviews[item.id] ? itemReviews[item.id] : { reviews: [], metrics: {} };
  const reviewCount = itemReviewData.reviews ? itemReviewData.reviews.length : 0;

  const numericHeight = parseFloat(height);
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