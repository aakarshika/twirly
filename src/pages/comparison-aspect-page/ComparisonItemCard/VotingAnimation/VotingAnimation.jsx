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

    const now = Date.now();
    const lastTap = tapCountRef.current;

    if (now - lastTap < 500 && now - lastTap > 0) {
      // Double tap detected
      tapCountRef.current = 0;
      clearTimeout(tapTimerRef.current);
      
      try {
        setIsVoting(true);
        
        // Show balloon hearts immediately
        const newBalloonHearts = Array.from({ length: 10 }, (_, i) => ({
          id: i,
          size: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          delay: i * 50
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
    } else {
      // First tap
      tapCountRef.current = now;
      setShowSingleHeart(true);
      setTimeout(() => setShowSingleHeart(false), 500);
      
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 500); // Reset after 500ms if no second tap
    }
  };

  return (
    <div 
      className="voting-animation-container"
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      <div className="heart-container">
        {showSingleHeart && 
          <div className="heart-container">
            <div className="heart" 
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }} >
            </div>
            {tapCountRef.current > 0 && (<div className="voting-instruction">
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