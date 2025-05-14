import React from 'react';
import { ThumbsUp } from 'lucide-react';
import VoteStats from './VoteStats/VoteStats';
import './ComparisonItemCard.css';

const VotedCard = ({
  item,
  newHeight = '35vh',
  handleRevertClick,
  handleItemClick,
  totalVotes,
  itemReviewData,
  reviewCount,
  isVotedItem
}) => {

  console.log(item);
  const getLighterShadeString = (color) => {
    const r = color.slice(4, 7);
    const g = color.slice(9, 12);
    const b = color.slice(14, 17);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

  //detect and convert hex to rgb:
  const isHexColor = /^(#|0x)[0-9A-Fa-f]+$/.test(item.item_color_string);
  //convert hex to rgb(r,g,b) where r,g,b are numbers between 0 and 255
  const color = isHexColor ? `rgb(${parseInt(item.item_color_string.slice(1, 3), 16)}, ${parseInt(item.item_color_string.slice(3, 5), 16)}, ${parseInt(item.item_color_string.slice(5, 7), 16)})` : item.item_color_string;

  return (
    <div
      className="comparison-item-card rounded-lg"
      style={{ 
        height: newHeight,
        border: '4px solid ' + color,
        backgroundColor: color.substring(0, color.length - 1) + ', 0.2)'
      }}
    >
      <div className="card-container">
        <div className="image-container">
          {isVotedItem && (
            <button
              className="you-voted-badge"
              onClick={handleRevertClick}
              type="button"
            >
              <ThumbsUp size={24} fill={'lightgray'} />
            </button>
          )}

          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="item-image"
              loading="lazy"
            />
          ) : (
            <div
              className="text-fallback"
              style={{
                background: getLighterShadeString(color),
                color: '#000'
              }}
            >
              <div className="text-fallback-content">
                <h3 className="text-fallback-title">{item.name}</h3>
                <p className="text-fallback-description">{item.description}</p>
              </div>
              <div 
                className="flex items-center gap-2 content-overlay"
                style={{
                  cursor: 'pointer',
                  backgroundColor: color,
                }}
                onClick={handleItemClick}
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
            </div>
          )}
        </div>

        {item.image_url && (
          <div 
            className="absolute bottom-0 left-0 right-0 p-4 content-overlay" 
            style={{ backgroundColor: color }}
          >
            <h3 className="item-name">{item.name}</h3>
            <p className="item-description">{item.description}</p>
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
      </div>
    </div>
  );
};

export default VotedCard; 