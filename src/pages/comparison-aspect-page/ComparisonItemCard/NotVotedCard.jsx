import React from 'react';
import './ComparisonItemCard.css';

const NotVotedCard = ({
    item,
    newHeight = '35vh',
  handleItemClick
}) => {

  return (
    <div
      className="comparison-item-card rounded-lg"
      style={{ 
        height: newHeight,
        border: '4px solid lightgray',
        backgroundColor: 'rgba(255, 255, 255, 0.4)'
      }}
    >
      <div className="card-container">
        <div className="image-container">
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
                background: 'rgba(22, 22, 22, 0.5)',
                color: '#fff'
              }}
            >
              <div className="text-fallback-content">
                <h3 className="text-fallback-title">{item.name}</h3>
                <p className="text-fallback-description">{item.description}</p>
              </div>
            </div>
          )}
        </div>

        {item.image_url && (
          <div 
            className="absolute bottom-0 left-0 right-0 p-4 content-overlay" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          >
            <h3 className="item-name">{item.name}</h3>
            <p className="item-description">{item.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotVotedCard; 