import { Heart, Share2Icon, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Share } from '@capacitor/share';
import { getCurrentUrl } from '../../lib/urlUtils';

const CompareButtons = ({ totalVotes, setData, handleLikeComparisonSet, voteButtonClicked }) => {
  const hasLiked = setData.hasLiked;
  const hasVoted = setData.hasVoted;
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  const handleShare = async () => {
    // Get the current URL using our utility function
    const currentUrl = getCurrentUrl();
    
    try {
      // Try Capacitor Share API first
      await Share.share({
        title: 'Check out this poll!',
        text: 'I found this interesting comparison on Twirly.',
        url: currentUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to Web Share API
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Check out this poll!',
            text: 'I found this interesting comparison on Twirly.',
            url: currentUrl
          });
        } else {
          // Final fallback to clipboard
          await navigator.clipboard.writeText(currentUrl);
          setShowCopiedTooltip(true);
          setTimeout(() => setShowCopiedTooltip(false), 2000);
        }
      } catch (fallbackError) {
        console.error('Fallback sharing error:', fallbackError);
        // Last resort fallback to clipboard
        await navigator.clipboard.writeText(currentUrl);
        setShowCopiedTooltip(true);
        setTimeout(() => setShowCopiedTooltip(false), 2000);
      }
    }
  };

  return (
    <div className='flex flex-col'>
      {setData.end_date && (<div className='flex flex-row font-normal text-text-muted justify-between mx-4'>
        <span className='text-sm font-normal'>
        <span className="font-normal">{totalVotes} Voters</span>
        </span>
        <span className='text-sm font-normal'>{'Ends in '}
          <span className='text-sm font-normal'>
            {formatDistanceToNow(setData.end_date, { addSuffix: false })}</span></span>
      </div>)}
      <div className="flex text-sm flex-row justify-between gap-2 p-2 bg-bg">
        <div className="flex rounded-full px-4 py-2 bg-surface gap-2"
          onClick={() => handleLikeComparisonSet(setData.id)}
          style={{ cursor: 'pointer' }}
        >
          <span className="inline-block mr-2">
            <Heart size={20}
              className={hasLiked ? 'text-primary' : 'text-text-muted'}
              fill={hasLiked ? 'color-mix(in srgb, var(--color-primary) 50%, transparent)' : 'none'}
            />
          </span>
          <span className="font-semibold">{setData.likeCount} Likes</span>
        </div>
        <div className="relative">
          <div className="flex rounded-full px-4 py-2 bg-surface gap-2"
            onClick={handleShare}
            style={{ cursor: 'pointer' }}
          >
            <span className="inline-block mr-2">
              <Share2Icon className='text-text-muted' size={20} />
            </span>
            <span className="font-semibold">Share</span>
          </div>
          {showCopiedTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-overlay text-text-inverse text-sm rounded-lg">
              Link copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareButtons; 