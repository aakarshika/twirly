import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { RadarChart } from '../../results/visualizations';
import { UserGroupIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const AppearancesTab = ({ comparisonSets, item }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Comparison History</h3>
          <div className="space-y-4">
            {comparisonSets?.map((set) => (
              <div 
                key={set.comparison_sets.id} 
                className="p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                style={{ backgroundColor: currentTheme.colors.background }}
                onClick={() => navigate(`/comparison/${set.comparison_sets.id}`)}
              >
                <h3 className="font-semibold mb-2 text-lg hover:text-blue-400 transition-colors"
                  style={{ color: currentTheme.colors.text }}
                >
                  {set.comparison_sets.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center" style={{ color: currentTheme.colors.textSecondary }}>
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <span>
                      {set.itemVotes}/{set.totalVotes} votes
                    </span>
                  </div>
                  <div className="flex items-center" style={{ color: currentTheme.colors.textSecondary }}>
                    <ChatBubbleOvalLeftIcon className="h-4 w-4 mr-2" />
                    <span>{set.commentCount} comments</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(set.itemVotes / set.totalVotes) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                    {Math.round((set.itemVotes / set.totalVotes) * 100)}% of total votes
                  </p>
                </div>
              </div>
            ))}
            {(!comparisonSets || comparisonSets.length === 0) && (
              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                No comparison history available
              </p>
            )}
          </div>
        </div>
        <div className="p-6 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Performance Analysis</h3>
          <RadarChart items={[item]} />
        </div>
      </div>
    </div>
  );
};

export default AppearancesTab; 