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

  // Calculate height
  const numericHeight = parseFloat(height);
  const newHeight = (numericHeight*2 / 7) + 'vh';

  const isVotedItem = userVoted && votedItemId === item.id;
  
  // Properly handle itemReviews data
  const itemReviewData = itemReviews && itemReviews[item.id] ? itemReviews[item.id] : { reviews: [], metrics: {} };
  const reviewCount = itemReviewData.reviews ? itemReviewData.reviews.length : 0;

  //get lighter shade for input string "rgb(135, 139, 164)" and return rgb(r,g,b,alpha)
  const getLighterShadeString = (color) => {
    const r = color.slice(4, 7);
    const g = color.slice(9, 12);
    const b = color.slice(14, 17);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };
  return (
    <div
      className={`comparison-item-card 
        ${showStartAnimation ? 'vote-animation' : ''}
        `}
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
          color={item.item_color_string}
          isActive={isVotedItem}
        />

{userVoted ? (
            <span></span>
          ) : (
            <VotingAnimation
            onVote={onVoteCasted}
            />
          )}
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
                background: userVoted ? getLighterShadeString(item.item_color_string) : 'rgba(22, 22, 22, 0.5)',
                color: userVoted ? '#000' : '#fff'
              }}
            >
              <div className="text-fallback-content">
                <h3 className="text-fallback-title">{item.name}</h3>
                <p className="text-fallback-description">{item.description}</p>
              </div>
              {userVoted && (
                <div className="flex items-center gap-2 content-overlay"
                  style={{
                      cursor: 'pointer',
                      backgroundColor: item.item_color_string,
                  }}
                  onClick={() => {
                    console.log("clicked")
                    handleItemClick()
                  }}
                >
                  <VoteStats
                    votes={item.votes.length}
                    totalVotes={totalVotes}
                    color={item.item_color_string}
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
              <div className="flex items-center gap-2" style={{
                cursor: 'pointer',
              }} onClick={() => {
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