import React, { useRef } from 'react';
import './VotingAnimation.css';

const VotingAnimation = ({ 
  onStartVoting, 
  onCancelVoting 
}) => {
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  const handleTap = (e) => {
    e.preventDefault();
    tapCountRef.current += 1;

    if (tapCountRef.current === 1) {
      // First tap
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 300); // Reset after 300ms if no second tap
    } else if (tapCountRef.current === 2) {
      // Double tap detected
      clearTimeout(tapTimerRef.current);
      tapCountRef.current = 0;
      onStartVoting();
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
      <div className="voting-instruction">
        Double tap to vote
      </div>
    </div>
  );
};

export default VotingAnimation; 