import React, { useRef, useState } from 'react';
import './VotingAnimation.css';

const VotingAnimation = ({ onVote }) => {
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);
  const [showSingleHeart, setShowSingleHeart] = useState(false);
  const [balloonHearts, setBalloonHearts] = useState([]);
  const [isVoting, setIsVoting] = useState(false);

  const handleTap = async (e) => {
    if (isVoting) return; // Prevent multiple votes while processing

    tapCountRef.current += 1;

    if (tapCountRef.current === 1) {
      // First tap - show single heart
      setShowSingleHeart(true);
      setTimeout(() => setShowSingleHeart(false), 500);
      
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 300); // Reset after 300ms if no second tap
    } else if (tapCountRef.current === 2) {
      // Double tap detected - show balloon hearts first, then cast vote
      clearTimeout(tapTimerRef.current);
      tapCountRef.current = 0;
      
      try {
        setIsVoting(true);
        
        // Show balloon hearts immediately
        const newBalloonHearts = Array.from({ length: 10 }, (_, i) => ({
          id: i,
          size: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          delay: i * 50 // Reduced delay between hearts
        }));
        setBalloonHearts(newBalloonHearts);
        
        // Wait a bit before casting the vote
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Cast vote
        await onVote(e);
        
        // Keep hearts visible for a while after vote
        setTimeout(() => {
          setBalloonHearts([]);
          setIsVoting(false);
        }, 100);
      } catch (error) {
        console.error('Error voting:', error);
        setBalloonHearts([]);
        setIsVoting(false);
      }
    }
  };

  return (
    <div 
      className="voting-animation-container"
      onClick={handleTap}
    >
      <div className="heart-container">
        {showSingleHeart && 
          <div className="heart-container">
            <div className="heart" 
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }} >
            </div>
            {tapCountRef.current === 1 && (<div className="voting-instruction">
              Double tap to vote
            </div>)}
          </div>
        }
        {balloonHearts.map(heart => (
          <div
            key={heart.id}
            className="heart-balloon"
            style={{
              left: heart.left,
              top: heart.top,
              animationDelay: `${heart.delay}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default VotingAnimation; 