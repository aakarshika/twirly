import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useComparisonItemCardAspect = ({
  item,
  userVoted,
  handleVote,
  handleRevertVote,
  votedItemId,
  totalVotes,
  itemReviews
}) => {
  const navigate = useNavigate();
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

  const onVoteCasted = async (e) => {
    if (userVoted) return;
    await handleVote(item.id);
  };

  const handleRevertClick = async (e) => {
    await handleRevertVote();
  };

  const isVotedItem = userVoted && votedItemId === item.id;
  
  // Properly handle itemReviews data
  const itemReviewData = itemReviews && itemReviews[item.id] ? itemReviews[item.id] : { reviews: [], metrics: {} };
  const reviewCount = itemReviewData.reviews ? itemReviewData.reviews.length : 0;

  return {
    imageError,
    showStartAnimation,
    isVotedItem,
    itemReviewData,
    reviewCount,
    handleItemClick,
    onVoteCasted,
    handleRevertClick
  };
}; 