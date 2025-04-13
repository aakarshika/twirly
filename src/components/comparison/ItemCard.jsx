// File: src/components/comparison/ItemCard.jsx

import React, { useState, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { useTheme } from '../../contexts/ThemeContext';
import ImageLoader from './ImageLoader';
import './ItemCard.css';
/**
 * Card component for displaying a single comparison item
 */
const ItemCard = ({ item, i, height }) => {
  const { 
    userVoted, 
    handleVote, 
    setActiveReviewItem,
    votedItemId
  } = useComparison();

  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const pressTimer = useRef(null);
  const progressInterval = useRef(null);

  const VOTE_DURATION = 1000; // 1 second

  const { currentTheme } = useTheme();

  const startVoting = () => {
    if (userVoted) return;
    
    setIsPressing(true);
    setProgress(0);
    
    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / VOTE_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(progressInterval.current);
        handleVote(item.id);
      }
    }, 10);

    pressTimer.current = setTimeout(() => {
      if (progress < 100) {
        clearInterval(progressInterval.current);
        setProgress(0);
      }
    }, VOTE_DURATION);
  };

  const cancelVoting = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (progressInterval.current) clearInterval(progressInterval.current);
    setIsPressing(false);
    setProgress(0);
  };

  const handleReviewButtonClick = (itemId) => {
    setActiveReviewItem(itemId);
  };
  const heightValue = height; 

  // Extract the numeric part and convert it to a number
  const numericHeight = parseFloat(heightValue); 
  
  // Divide by 4
  const newHeight = (numericHeight / 4) + 'vh'; 
  
  console.log("height",height,newHeight);
  return (
    <div className="" style={{ height: newHeight }}>
      <div className="relative h-full" >
        <div 
          style={{ 
            backgroundColor: currentTheme.colors.card,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text
          }}
          className={`relative h-full flex flex-col border rounded-lg overflow-hidden transition-all ${
            votedItemId === item.id ? 'border-amber-400' : 'border-gray-800'
          }`}
          onMouseDown={!userVoted ? startVoting : undefined}
          onMouseUp={!userVoted ? cancelVoting : undefined}
          onMouseLeave={!userVoted ? cancelVoting : undefined}
          onTouchStart={!userVoted ? startVoting : undefined}
          onTouchEnd={!userVoted ? cancelVoting : undefined}
        >
          
          <div className="flex-1">
            <ImageLoader 
              image={item.image} 
              name={item.name} 
              item={item}
              index={i} 
              height={height}
              isPressing={isPressing} 
              progress={progress} 
              userVoted={userVoted} 
              itemId={item.id} 
              handleVote={handleVote} 
              startVoting={startVoting} 
              cancelVoting={cancelVoting} 
              votedItemId={votedItemId}
              />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ItemCard;