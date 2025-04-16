import React from 'react';
import './VoteStats.css';

const VoteStats = ({ votes, totalVotes, color, isVotedItem }) => {
  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  
  return (
    
    <div className="vote-stats-container">
      
      <div className="vote-badge">
        <span className="vote-count">{votes}</span>
        <span className="vote-label">votes</span>
        <span className="vote-percentage">{Math.round(percentage)}%</span>
        
      </div>
      <div className="vote-progress">
        <div 
          className="progress-bar"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
      
      
    </div>
  );
};

export default VoteStats; 