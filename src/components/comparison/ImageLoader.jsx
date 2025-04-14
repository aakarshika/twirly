import React, { useState } from 'react';
import { COMPARISON_COLOR_SET } from '../../lib/constants';
import VotingProgress from './VotingProgress';

const ImageLoader = ({ item, index, isPressing, progress, userVoted, itemId, handleVote, startVoting, cancelVoting, votedItemId, height }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div className="relative w-full h-full">
      {!imageError ? (
        <div className="relative w-full h-full">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-400"></div>
            </div>
          )}

          <VotingProgress
            isPressing={isPressing}
            progress={progress}
            userVoted={userVoted}
            itemId={item.id}
            handleVote={handleVote}
            startVoting={startVoting}
            cancelVoting={cancelVoting}
            votedItemId={votedItemId}
          />
          <img
            src={item.image}
            alt={item.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
          {/* Text Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent" style={{ background: userVoted ? COMPARISON_COLOR_SET[index] : 'rgba(22, 22, 22, 0.5)', zIndex: 10 }}>
            <h3 className="text-xl font-bold text-white line-clamp-1">{item.name}</h3>
            <p className="text-gray-200 text-sm line-clamp-2">{item.description}</p>

            {userVoted && (
              <div className="text-sm text-white-400">
                {item.votes} {item.votes === 1 ? 'vote' : 'votes'}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800" style={{ background: userVoted ? COMPARISON_COLOR_SET[index] : 'rgba(22, 22, 22, 0.5)' }}>
          <div className="text-center px-4">
            <h3 className="text-xl font-bold text-white line-clamp-1">{item.name}</h3>
            <p className="text-gray-200 text-sm line-clamp-2">{item.description}</p>
            {userVoted && (
              <div className="text-sm text-white-400">
                {item.votes} {item.votes === 1 ? 'vote' : 'votes'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageLoader;
