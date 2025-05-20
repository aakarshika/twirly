import React from 'react';
import { useNotVotedCard } from '../../../hooks/useNotVotedCard';
import './ComparisonItemCard.css';

const NotVotedCard = ({
  item,
  newHeight = '25vh',
  handleItemClick
}) => {
  const {
    titleRef,
    itemImage
  } = useNotVotedCard({
    item,
    handleItemClick
  });

  return (
    <div
      className="comparison-item-card rounded-lg"
      style={{ 
        height: newHeight,
        backgroundColor: 'rgba(255, 255, 255, 0.4)'
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
                background: 'rgba(22, 22, 22, 0.5)',
                color: '#fff'
              }}
            >
              <div className="text-fallback-content">
                <h3 ref={titleRef} className="text-fallback-title">{item.name}</h3>
              </div>
            </div>
          )}
        </div>

        {itemImage && (
          <div 
            className="absolute bottom-0 left-0 right-0 p-4 content-overlay" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          >
            <h3 className="item-name">{item.name}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotVotedCard; 