import React, { useRef, useState } from 'react';
import './VotingAnimation.css';

const VotingAnimation = ({ 
  onStartVoting, 
  onCancelVoting 
}) => {
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);
  const [showSingleHeart, setShowSingleHeart] = useState(false);
  const [balloonHearts, setBalloonHearts] = useState([]);

  const handleTap = (e) => {
    e.preventDefault();
    tapCountRef.current += 1;

    if (tapCountRef.current === 1) {
      // First tap - show single heart
      setShowSingleHeart(true);
      setTimeout(() => setShowSingleHeart(false), 1000);
      
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 300); // Reset after 300ms if no second tap
    } else if (tapCountRef.current === 2) {
      // Double tap detected - cast vote first, then show balloon hearts
      clearTimeout(tapTimerRef.current);
      tapCountRef.current = 0;
      
      // Cast vote immediately
      onStartVoting();
      
      // Create multiple balloon hearts
      const newBalloonHearts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: i * 100
      }));
      setBalloonHearts(newBalloonHearts);
      
      // Clear hearts after animation
      setTimeout(() => {
        setBalloonHearts([]);
      }, 2000);
    }
  };

  return (
    <div 
      className="voting-animation-container"
      onTouchStart={handleTap}
      onTouchEnd={(e) => e.preventDefault()}
      onMouseDown={handleTap}
      onMouseUp={(e) => e.preventDefault()}
      onMouseLeave={(e) => e.preventDefault()}
    >
      {/* <div className="voting-instruction">
        Double tap to vote
      </div> */}
      
      <div className="heart-container">
        {showSingleHeart && <div className="heart" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }} />}
        {balloonHearts.map(heart => (
          <div
            key={heart.id}
            className="heart-balloon"
            style={{
              left: heart.left,
              animationDelay: `${heart.delay}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default VotingAnimation; 