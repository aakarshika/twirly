import React from 'react';
import './VoteStats.css';
import { MessagesSquare, Star } from 'lucide-react';

const VoteStats = ({ votes, totalVotes, color, isVotedItem, reviewCount, itemReviewData }) => {
  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  
  return (
    <div className="vote-stats-container">
      <div className="flex flex-row gap-1 w-full items-center">
        <span className="text-sm text-right">{Math.round(percentage)}%</span>
        <div className="vote-progress w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="progress-bar h-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              minWidth: '3px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VoteStats; 