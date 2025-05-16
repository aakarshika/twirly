import React from 'react';
import { Heart } from 'lucide-react';
import VoteStats from './VoteStats/VoteStats';
import { useVotedCard } from '../../../hooks/useVotedCard';
import './ComparisonItemCard.css';

const VotedCard = ({
  item,
  newHeight = '25vh',
  handleRevertClick,
  handleItemClick,
  totalVotes = 0,
  itemReviewData = { reviews: [], metrics: {} } || null,
  reviewCount = 0,
  isVotedItem
}) => {
  const {
    titleRef,
    itemImage,
    color
  } = useVotedCard({
    item,
    handleRevertClick,
    handleItemClick,
    totalVotes,
    itemReviewData,
    reviewCount,
    isVotedItem
  });

  return (
    <div className="flex flex-col bg-white w-full rounded-lg" >
      <div
        className="comparison-item-card rounded-lg"
        style={{ 
          aspectRatio: '1/1',
          height: newHeight,
          border: '4px solid ' + color,
          backgroundColor: color?.substring(0, color.length - 1) + ', 0.2)'
        }}
      >
        <div className="card-container">
          <div className="image-container">
            {itemImage ? (
              <img
                src={itemImage}
                alt={item.name}
                className="item-image"
                loading="lazy"
              />
            ) : (
              <div
                className="text-fallback"
                style={{
                  background: color?.substring(0, color.length - 1) + ', 0.2)',
                  color: '#000'
                }}
                onClick={handleItemClick}
              >
                <div className="flex flex-col text-fallback-content">
                  <h3 ref={titleRef} className="text-fallback-title" style={{ color: item.item_color_string }}>{item.name}</h3>
                </div>
                {item.votes?.length > 0 && (
                  <div 
                    className="flex items-center content-overlay"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: color,
                    }}
                  >
                    <VoteStats
                      votes={item.votes?.length || 0}
                      totalVotes={totalVotes}
                      color={color}
                      isVotedItem={isVotedItem}
                      reviewCount={reviewCount}
                      itemReviewData={itemReviewData}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {itemImage && (
            <div 
              className="bottom-0 left-0 right-0 p-4 content-overlay" 
              onClick={handleItemClick}
              style={{ backgroundColor: color }}
            >
              <h3 className="item-name">{item.name}</h3>
              {item.votes?.length > 0 && (
                <div 
                  className="flex items-center gap-2" 
                  style={{ cursor: 'pointer' }} 
                  onClick={handleItemClick}
                >
                  <VoteStats
                    votes={item.votes?.length || 200}
                    totalVotes={totalVotes || 350}
                    color={color}
                    isVotedItem={isVotedItem}
                    reviewCount={reviewCount}
                    itemReviewData={itemReviewData}
                  />
                </div>
              )}
            </div>
          )}

          <div className="absolute top-0 right-0">
            {isVotedItem && (
              <button
                className="you-voted-badge"
                onClick={handleRevertClick}
                type="button"
              >
                <Heart size={24} fill={'red'} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotedCard; 