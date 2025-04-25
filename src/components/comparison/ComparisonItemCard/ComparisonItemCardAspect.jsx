import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import VotingAnimation from './VotingAnimation/VotingAnimation';
import VoteStats from './VoteStats/VoteStats';
import ColorCoding from './ColorCoding/ColorCoding';
import './ComparisonItemCard.css';
import { ThumbsUp, X, Star } from 'lucide-react';
import { COMPARISON_COLOR_SET } from '../../../lib/constants';

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
  const [isVoting, setIsVoting] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const handleItemClick = (e) => {
    navigate(`/item/${item.id}`);
  };

  const startVoting = () => {
    if (userVoted) return;
    handleVote(item.id);
  };

  const handleRevertClick = (e) => {
    e.stopPropagation();
    handleRevertVote();
  };

  // Calculate height
  const numericHeight = parseFloat(height);
  const newHeight = (numericHeight / 3) + 'vh';

  const isVotedItem = userVoted && votedItemId === item.id;
  
  // Properly handle itemReviews data
  const itemReviewData = itemReviews && itemReviews[item.id] ? itemReviews[item.id] : { reviews: [], metrics: {} };
  const reviewCount = itemReviewData.reviews ? itemReviewData.reviews.length : 0;

  // Function to get a lighter shade of a color
  const getLighterShade = (color) => {
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Make it lighter by adding white
    const lighterR = Math.min(255, r + 40);
    const lighterG = Math.min(255, g + 40);
    const lighterB = Math.min(255, b + 40);

    // Convert back to hex
    return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
  };

  return (
    <div
      className="comparison-item-card"
      style={{ height: newHeight }}
    >
      <div
        className="card-container"
        style={{
          backgroundColor: currentTheme.colors.card,
          borderColor: currentTheme.colors.border,
        }}
      >
        <ColorCoding
          color={COMPARISON_COLOR_SET[index]}
          isActive={isVotedItem}
        />

        <div className="image-container">
          {isVotedItem && (
            <button
              className="you-voted-badge"
              onClick={handleRevertClick}
              type="button"
            >
              <ThumbsUp style={{ width: '12px', height: '12px' }} />
              <span>Your vote</span>
              <X style={{ width: '12px', height: '12px' }} />
            </button>
          )}

          {userVoted ? (
            <span></span>
          ) : (
            <VotingAnimation
              onStartVoting={startVoting}
              onCancelVoting={() => { }}
            />
          )}
          {!imageError ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="item-image"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="text-fallback"
              style={{
                background: userVoted ? getLighterShade(COMPARISON_COLOR_SET[index]) : 'rgba(22, 22, 22, 0.5)',
                color: userVoted ? '#000' : '#fff'
              }}
            >
              <div className="text-fallback-content">
                <h3 className="text-fallback-title">{item.name}</h3>
                <p className="text-fallback-description">{item.description}</p>
              </div>
              {userVoted && (
                <div className="flex items-center gap-2 content-overlay"
                  onClick={() => {
                    console.log("clicked")
                    handleItemClick()
                  }}
                >
                  <VoteStats
                    votes={item.votes.length}
                    totalVotes={totalVotes}
                    color={COMPARISON_COLOR_SET[index]}
                    isVotedItem={isVotedItem}
                    reviewCount={reviewCount}
                    itemReviewData={itemReviewData}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {!imageError && (
          <div className="absolute bottom-0 left-0 right-0 p-4 content-overlay">
            <h3 className="item-name">
              {item.name}
            </h3>
            <p className="item-description">{item.description}</p>

            {userVoted ? (
              <div className="flex items-center gap-2" onClick={() => {
                console.log("clicked")
                handleItemClick()
              }}
              >
                <VoteStats
                  votes={item.votes.length}
                  totalVotes={totalVotes}
                  color={COMPARISON_COLOR_SET[index]}
                  isVotedItem={isVotedItem}
                  reviewCount={reviewCount}
                  itemReviewData={itemReviewData}
                />
              </div>
            ) : (
              <span></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonItemCardAspect; 