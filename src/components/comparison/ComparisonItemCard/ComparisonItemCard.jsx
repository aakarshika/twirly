import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import VotingAnimation from './VotingAnimation/VotingAnimation';
import VoteStats from './VoteStats/VoteStats';
import ColorCoding from './ColorCoding/ColorCoding';
import './ComparisonItemCard.css';
import { ThumbsUp } from 'lucide-react';
import { COMPARISON_COLOR_SET } from '../../../lib/constants';


const ComparisonItemCard = ({ 
  item, 
  index, 
  height, 
  userVoted, 
  handleVote, 
  votedItemId,
  totalVotes 
}) => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [isVoting, setIsVoting] = useState(false);

  const handleItemClick = (e) => {
    if (!userVoted) {
      navigate(`/item/${item.id}`);
    }
  };

  const startVoting = () => {
    if (userVoted) return;
    handleVote(item.id);
  };

  // Calculate height
  const numericHeight = parseFloat(height);
  const newHeight = (numericHeight / 3) + 'vh';

  const isVotedItem = userVoted && votedItemId === item.id;

  return (
    <div 
      className="comparison-item-card"
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
          color={COMPARISON_COLOR_SET[index]}
          isActive={isVotedItem}
        />
        
        <div className="image-container">

            {isVotedItem && (
                <div className="absolute text-white text-sm top-0 right-0 bg-black/50 rounded-full px-2 py-1 you-voted-badge">
                <ThumbsUp style={{ width: '12px', height: '12px', marginRight: '4px' }} /> Your vote
                </div>
            )}

          {userVoted ? (
            <span></span>
          ) : (
            <VotingAnimation
              onStartVoting={startVoting}
              onCancelVoting={() => {}}
            />
          )}
          <img
            src={item.image}
            alt={item.name}
            className="item-image"
            loading="lazy"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 content-overlay">
          <h3 
            onClick={handleItemClick}
            className="item-name"
          >
            {item.name}
          </h3>
          <p className="item-description">{item.description}</p>
          
          {userVoted ? (
            <VoteStats 
              votes={item.votes}
              totalVotes={totalVotes}
              color={COMPARISON_COLOR_SET[index]}
              isVotedItem={isVotedItem}
            />
          ) : (
            <span></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonItemCard; 