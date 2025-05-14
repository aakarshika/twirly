import React, { useEffect, useRef } from 'react';
import { Heart, ThumbsUp } from 'lucide-react';
import VoteStats from './VoteStats/VoteStats';
import './ComparisonItemCard.css';
import { getPublicUrlItems } from '../../../lib/utils';

const VotedCard = ({
  item,
  newHeight = '35vh',
  handleRevertClick,
  handleItemClick,
  totalVotes = 0,
  itemReviewData = { reviews: [], metrics: {} } || null,
  reviewCount = 0,
  isVotedItem
}) => {
  const titleRef = useRef(null);
  const itemImage = item.image_url && item.image_url.startsWith('https://') ? item.image_url : getPublicUrlItems(item.image_url);

  useEffect(() => {
    if (titleRef.current) {
      const titleElement = titleRef.current;
      const wordCount = item.name.trim().split(/\s+/).length;
      
      if (wordCount > 10) {
        titleElement.style.fontSize = '0.875rem';
      } else {
        titleElement.style.fontSize = '1.5rem';
      }
    }
  }, [item.name]);

  //detect and convert hex to rgb:
  const isHexColor = /^(#|0x)[0-9A-Fa-f]+$/.test(item.item_color_string);
  //convert hex to rgb(r,g,b) where r,g,b are numbers between 0 and 255
  const color = isHexColor ? `rgb(${parseInt(item.item_color_string.slice(1, 3), 16)}, ${parseInt(item.item_color_string.slice(3, 5), 16)}, ${parseInt(item.item_color_string.slice(5, 7), 16)})` : item.item_color_string;

  return (
    <div className="flex flex-col bg-gray-500 rounded-lg">
    <div
      className="comparison-item-card rounded-lg"
      style={{ 
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
            >
              <div className="flex flex-col text-fallback-content">
                <h3 ref={titleRef} className="text-fallback-title" style={{ color: 'white' }}>{item.name}</h3>
              </div>
              <div 
                className="flex items-center content-overlay"
                style={{
                  cursor: 'pointer',
                  backgroundColor: color,
                }}
                onClick={handleItemClick}
              >
                <span className="" style={{ color: item.item_color_string }}>Y</span>
                <VoteStats
                  votes={item.votes?.length || 0}
                  totalVotes={totalVotes}
                  color={color}
                  isVotedItem={isVotedItem}
                  reviewCount={reviewCount}
                  itemReviewData={itemReviewData}
                />
              </div>
            </div>
          )}
        </div>

        {itemImage && (
          <div 
            className="bottom-0 left-0 right-0 p-4 content-overlay" 
            style={{ backgroundColor: color }}
          >
            <h3 className="item-name">{item.name}</h3>
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
          </div>
        )}


<div className="absolute top-0 right-0">
          {isVotedItem && (
            <button
              className="you-voted-badge"
              onClick={() => {
                console.log('revert clickkkkk');
                handleRevertClick();
              }}
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