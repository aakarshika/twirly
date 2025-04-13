import React from 'react';
import { ThumbsUp } from 'lucide-react';

const VotingProgress = ({ isPressing, progress, userVoted, itemId, handleVote, startVoting, cancelVoting, votedItemId }) => {
  return (
    <div className="absolute inset-0">
          {/* Progress Fill */}
          <div 
            className={`absolute inset-0 transition-all duration-100 ${
              votedItemId === itemId ? 'bg-amber-400/30' : 'bg-primary-500/30'
            }`}
            style={{ 
              width: votedItemId === itemId ? '100%' : `${progress}%`,
              clipPath: 'none'
            }}
          />
          
          {/* Progress Marker */}
          <div className="absolute top-0 right-0 w-1 h-full bg-primary-500/50" />
          
          {/* Progress Text */}
          {isPressing && !userVoted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                Hold to vote ({Math.round(progress)}%)
              </div>
            </div>
          )}

          {/* Already Voted Indicator */}
          {userVoted && votedItemId === itemId && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-amber-400/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-amber-400 text-sm font-medium flex items-center gap-2 border border-amber-400/30">
                <ThumbsUp size={14} />
                <span>Your Vote</span>
              </div>
            </div>
          )}
        </div>
  );
};

export default VotingProgress;
