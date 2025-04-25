import React from 'react';
import './VoteStats.css';
import { MessagesSquare, Star } from 'lucide-react';

const VoteStats = ({ votes, totalVotes, color, isVotedItem, reviewCount, itemReviewData }) => {
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
            backgroundColor: color,
            minWidth: '10px'
          }}
        />
      </div>

      {reviewCount > 0 && (
        <div className="flex-row mt-2">
          <span className="flex items-center gap-1 highlighted-aspect-reply">
            <MessagesSquare size={14} fill="currentColor" />
            <span className="text-gray-100 mb-2 item-description">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </span>
          <div className="flex-row">
            {itemReviewData.metrics && Object.entries(itemReviewData.metrics).map(([metricName, metricData]) => (
              metricData.average > 3.5 && (
                <span key={metricName} className="flex items-center gap-1 highlighted-aspect item-description">
                  <span className="text-gray-300">{metricName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                  <span className="flex items-center gap-1 text-amber-400">
                    {metricData.average.toFixed(1)}
                    <Star size={12} fill="currentColor" />
                  </span>
                </span>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoteStats; 