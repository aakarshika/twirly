import React from 'react';
import { useVotedCard } from '../../../hooks/useVotedCard';
import './ComparisonItemCard.css';

const NotVotedCard = ({
  item,
  newHeight = '20vh',
}) => {
  const {
    titleRef,
    itemImage,
  } = useVotedCard({
    item,
  });

  return (
    <div
      className="comparison-item-card rounded-lg"
      style={{
        height: newHeight,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
                color: '#fff',
              }}
            >
              <div className="text-fallback-content flex items-center justify-center">
                <h3 ref={titleRef} className="text-fallback-title text-center">{item.name}</h3>
              </div>
            </div>
          )}
        </div>

        {itemImage && (
          <div
            className=" p-4 content-overlay flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          >
            <h3 className="item-name text-center text-white">{item.name}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotVotedCard;
