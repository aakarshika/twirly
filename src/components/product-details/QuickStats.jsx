import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon as VoteIcon,
  CubeIcon
} from '@heroicons/react/24/solid';

const QuickStats = ({ comparisonSets, reviews }) => {
  const { currentTheme } = useTheme();

  const totalVotes = comparisonSets.reduce((sum, set) => sum + (set.itemVotes || 0), 0);
  const winRate = comparisonSets.length > 0 
    ? Math.round((comparisonSets.filter(set => (set.itemVotes || 0) > (set.totalVotes || 0) / 2).length / comparisonSets.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
        <div className="flex items-center">
          <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: currentTheme.colors.primary + '20' }}>
            <ChartBarSquareIcon className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Comparisons</p>
            <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{comparisonSets.length}</p>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
        <div className="flex items-center">
          <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: currentTheme.colors.primary + '20' }}>
            <ChatBubbleLeftRightIcon className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Reviews</p>
            <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{reviews.length}</p>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
        <div className="flex items-center">
          <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: currentTheme.colors.primary + '20' }}>
            <VoteIcon className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Total Votes</p>
            <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{totalVotes}</p>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
        <div className="flex items-center">
          <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: currentTheme.colors.primary + '20' }}>
            <CubeIcon className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Win Rate</p>
            <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{winRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats; 