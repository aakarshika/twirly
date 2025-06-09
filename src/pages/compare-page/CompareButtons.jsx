import { Heart, Share, Share2Icon, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { changeColorAlpha } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

const CompareButtons = ({ totalVotes, setData, handleLikeComparisonSet, voteButtonClicked }) => {
  const { currentTheme } = useTheme();
  const hasLiked = setData.hasLiked;
  const hasVoted = setData.hasVoted;
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'Check out this poll!',
      text: 'I found this interesting comparison on Twirly.',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Enhanced fallback for desktop browsers
        await navigator.clipboard.writeText(window.location.href);
        setShowCopiedTooltip(true);
        setTimeout(() => setShowCopiedTooltip(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className='flex flex-col'>
      {setData.end_date && (<div className='flex flex-row font-normal text-gray-500 justify-between mx-4'>
        <span className='text-sm font-semibold'>{'Started '}
          <span className='text-sm font-semibold'>
            {formatDistanceToNow(setData.start_date, { addSuffix: false })}</span></span>
        <span className='text-sm font-semibold'>{'Ends in '}
          <span className='text-sm font-semibold'>
            {formatDistanceToNow(setData.end_date, { addSuffix: false })}</span></span>
      </div>)}
  <div className="flex text-sm flex-row justify-between gap-2 p-2 bg-white">
    <div className="flex rounded-full px-4 py-2 bg-gray-100 gap-2" 
    onClick={() => handleLikeComparisonSet(setData.id)}
    style={{ cursor: 'pointer' }}
    >
      <span className=" inline-block mr-2" ><Heart size={20}
      color={hasLiked ? currentTheme.colors.primary : 'gray'}
      fill={hasLiked ? changeColorAlpha(currentTheme.colors.primary, 0.5) : 'none'}
       /></span>
      <span className="font-semibold">{setData.likeCount} Likes</span>
    </div>
    <div className="flex rounded-full px-4 py-2 bg-gray-100 gap-2"
    onClick={() => voteButtonClicked(setData.id)}
    style={{ cursor: 'pointer' }}
    >
      <span className=" inline-block mr-2" ><ThumbsUp size={20} 
      color={hasVoted ? currentTheme.colors.primary : 'gray'}
      fill={hasVoted ? changeColorAlpha(currentTheme.colors.primary, 0.5) : 'none'}
       /></span>
      <span className="font-semibold">{totalVotes} Votes</span>
    </div>
    <div className="relative">
      <div className="flex rounded-full px-4 py-2 bg-gray-100 gap-2"
      onClick={handleShare}
      style={{ cursor: 'pointer' }}
      >
        <span className=" inline-block mr-2" ><Share2Icon color={'gray'} size={20} /></span>
        <span className="font-semibold">Share</span>
      </div>
      {showCopiedTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg">
          Link copied to clipboard!
        </div>
      )}
    </div>
  </div>
  </div>
  );
};

export default CompareButtons; 