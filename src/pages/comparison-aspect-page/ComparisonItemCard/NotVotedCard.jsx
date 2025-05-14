import React, { useEffect, useRef } from 'react';
import './ComparisonItemCard.css';
import { getPublicUrlItems } from '../../../lib/utils';

const NotVotedCard = ({
    item,
    newHeight = '35vh',
    handleItemClick
}) => {
  const titleRef = useRef(null);
  const itemImage = item.image_url && item.image_url.startsWith('http') ? item.image_url : getPublicUrlItems(item.image_url);

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