import React from 'react';
import { Heart } from 'lucide-react';
import VoteStats from './VoteStats/VoteStats';
import { useVotedCard } from '../../../hooks/useVotedCard';
import './ComparisonItemCard.css';
import { changeColorAlpha, darkenColor } from '../../../lib/utils';

const VotedCard = ({
  item,
  handleRevertClick,
  handleItemClick,
  totalVotes = 0,
  isVotedItem,
  userVoted
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
    isVotedItem
  });

  return (
    <div className="flex flex-col bg-white w-full rounded-lg" >
      <div
        className="comparison-item-card rounded-lg"
        style={{ 
          aspectRatio: '1/1',
          height: itemImage ? '30vh': '25vh' ,
          backgroundColor: changeColorAlpha(color, 0.2)
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
                className="flex h-full justify-center flex-col items-center p-3"
                onClick={handleItemClick}
              >
                <div className="flex justify-center items-center">
                  <h3 ref={titleRef} className="text-center" style={{ color: darkenColor(color, 70) }}>{item.name}</h3>
                </div>
                <div className="p-2" style={{ color: darkenColor(color, 80), cursor: 'pointer' }}>
                  <VoteStats
                    votes={item.voteCount}
                    totalVotes={totalVotes}
                    color={color}
                    isVotedItem={isVotedItem}
                  />
                </div>
              </div>
            )}
          </div>

          {itemImage && (
            <div 
              className="bottom-0 left-0 right-0 p-4 content-overlay" 
              onClick={handleItemClick}
              style={{ color: darkenColor(color, 50)}}
            >
              <h3 className="item-name">{item.name}</h3>
              <div 
                className="flex items-center gap-2" 
                style={{ cursor: 'pointer' }} 
                onClick={handleItemClick}
              >
                <VoteStats
                  votes={item.voteCount}
                  totalVotes={totalVotes}
                  color={color}
                  isVotedItem={isVotedItem}
                />
              </div>
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