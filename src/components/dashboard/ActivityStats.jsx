import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { BarChart2, MessageSquare, ThumbsUp, Vote, Package } from 'lucide-react';

const StatCard = ({ title, value, icon }) => {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="flex-1 p-4 rounded-lg"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p 
            className="text-sm"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {title}
          </p>
          <p 
            className="text-2xl font-bold mt-1"
            style={{ color: currentTheme.colors.text }}
          >
            {value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentTheme.colors.primary + '20' }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const ActivityStats = ({ votesCount, reviewsCount, pollsCount, likesCount }) => {
  const { currentTheme } = useTheme();

  const stats = [
    { 
      title: 'Products', 
      value: pollsCount || 0, 
      icon: <Package size={20} style={{ color: currentTheme.colors.primary }} /> 
    },
    { 
      title: 'Comparisons', 
      value: pollsCount || 0, 
      icon: <BarChart2 size={20} style={{ color: currentTheme.colors.primary }} /> 
    },
    { 
      title: 'Reviews', 
      value: reviewsCount || 0, 
      icon: <MessageSquare size={20} style={{ color: currentTheme.colors.primary }} /> 
    },
    { 
      title: 'Votes', 
      value: votesCount || 0, 
      icon: <Vote size={20} style={{ color: currentTheme.colors.primary }} /> 
    },
    { 
      title: 'Likes', 
      value: likesCount || 0, 
      icon: <ThumbsUp size={20} style={{ color: currentTheme.colors.primary }} /> 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

export default ActivityStats; 