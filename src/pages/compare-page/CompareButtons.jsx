import { Heart, Share, ThumbsUp } from 'lucide-react';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { changeColorAlpha } from '../../lib/utils';

const CompareButtons = ({ totalVotes, setData, handleLikeComparisonSet }) => {
  const { currentTheme } = useTheme();
  const hasLiked = setData.hasLiked;
  const hasVoted = setData.hasVoted;
  return (
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
    <div className="flex rounded-full px-4 py-2 bg-gray-100 gap-2">
      <span className=" inline-block mr-2" ><ThumbsUp size={20} 
      color={hasVoted ? currentTheme.colors.primary : 'gray'}
      fill={hasVoted ? changeColorAlpha(currentTheme.colors.primary, 0.5) : 'none'}
       /></span>
      <span className="font-semibold">{totalVotes} Votes</span>
    </div>
    <div className="flex rounded-full px-4 py-2 bg-gray-100 gap-2">
      <span className=" inline-block mr-2" ><Share size={20} /></span>
      <span className="font-semibold">Share</span>
    </div>
  </div>
  );
};

export default CompareButtons; 