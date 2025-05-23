import React, { useState } from 'react';
import { Heart, Info } from 'lucide-react';
import VoteStats from './VoteStats/VoteStats';
import { useVotedCard } from '../../../hooks/useVotedCard';
import './ComparisonItemCard.css';
import { changeColorAlpha, darkenColor } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/common/Modal';
import { useTheme } from '../../../contexts/ThemeContext';

const VotedCard = ({
  item,
  handleRevertClick,
  totalVotes = 0,
  isVotedItem,
  userVoted
}) => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    titleRef,
    itemImage,
    color
  } = useVotedCard({
    item,
    handleRevertClick,
    totalVotes,
    isVotedItem
  });

  const handleItemClick = (e) => {
    navigate(`/item/${item.id}`);
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <div className={`flex flex-col bg-white w-full rounded-lg ${isVotedItem ? 'voted-card-border' : ''}`} >
      <div
        className={`comparison-item-card rounded-lg `}
        style={{ 
          aspectRatio: '1/1',
          height: itemImage ? '30vh': '25vh' ,
          backgroundImage: isVotedItem ? `linear-gradient(to bottom, ${color}, ${changeColorAlpha(color, 0.8)} , ${changeColorAlpha(color, 0.2)}` : `linear-gradient(to bottom, ${changeColorAlpha(color, 0.2)}, ${changeColorAlpha(color, 0.2)} , ${changeColorAlpha(color, 0.2)}`
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
              >
                <div className="flex justify-center items-center">
                  <h3 ref={titleRef} className="text-center" style={{ color: darkenColor(color, 70) }}>{item.name}</h3>
                </div>
                <div className="p-2 w-full" style={{ color: darkenColor(color, 80) }}>
                  <VoteStats
                    votes={item.voteCount}
                    totalVotes={totalVotes}
                    color={color}
                    isVotedItem={isVotedItem}
                    leadingMetrics={item.leadingMetrics}
                  />
                </div>
              </div>
            )}
          </div>

          {itemImage && (
            <div 
              className="bottom-0 left-0 right-0 p-4 content-overlay" 
              style={{ color: darkenColor(color, 50)}}
            >
              <h3 className="item-name">{item.name}</h3>
              <div 
                className="flex items-center gap-2"
              >
                <VoteStats
                  votes={item.voteCount}
                  totalVotes={totalVotes}
                  color={color}
                  isVotedItem={isVotedItem}
                  leadingMetrics={item.leadingMetrics}
                />
              </div>
            </div>
          )}

          <div className="absolute top-0 right-0 z-20">
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

          <div className="absolute bottom-2 right-2 z-20">
            <button
              className="p-2 rounded-full hover:bg-black/10 transition-colors"
              onClick={handleInfoClick}
              style={{ 
                color: darkenColor(color, 50),
                backgroundColor: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={item.name}
        size="md"
        className="bg-white dark:bg-gray-900"
      >
        <div className="space-y-4">
          {itemImage && (
            <div className="w-full aspect-square rounded-lg overflow-hidden">
              <img
                src={itemImage}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{item.name}</h3>
            {item.description && (
              <p style={{ color: currentTheme.colors.textSecondary }}>{item.description}</p>
            )}
            <div className="flex items-center gap-2">
              <VoteStats
                votes={item.voteCount}
                totalVotes={totalVotes}
                color={color}
                isVotedItem={isVotedItem}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleItemClick}
              className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              Go to Item Page
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VotedCard; 