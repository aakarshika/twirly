import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { BarChart2, MessageSquare, Vote, Package, Clock, TrendingUp } from 'lucide-react';
import ActivityVisualizations from './ActivityVisualizations';

const RecentActivityCard = ({ activity }) => {
  const { currentTheme } = useTheme();

  const getActivityIcon = type => {
    switch (type) {
      case 'product':
        return <Package size={16} style={{ color: currentTheme.colors.primary }} />;
      case 'comparison':
        return <BarChart2 size={16} style={{ color: currentTheme.colors.primary }} />;
      case 'review':
        return <MessageSquare size={16} style={{ color: currentTheme.colors.primary }} />;
      case 'vote':
        return <Vote size={16} style={{ color: currentTheme.colors.primary }} />;
      default:
        return <Clock size={16} style={{ color: currentTheme.colors.primary }} />;
    }
  };

  return (
    <div
      className="flex items-center p-3 rounded-lg mb-2"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
        style={{ backgroundColor: currentTheme.colors.primary + '20' }}
      >
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p
          className="text-sm font-medium"
          style={{ color: currentTheme.colors.text }}
        >
          {activity.description}
        </p>
        <p
          className="text-xs"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          {activity.timestamp}
        </p>
      </div>
    </div>
  );
};

const ActivityTrend = ({ title, value, change }) => {
  const { currentTheme } = useTheme();
  const isPositive = change >= 0;

  return (
    <div
      className="p-4 rounded-lg"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <p
        className="text-sm"
        style={{ color: currentTheme.colors.textSecondary }}
      >
        {title}
      </p>
      <div className="flex items-center justify-between mt-1">
        <p
          className="text-xl font-bold"
          style={{ color: currentTheme.colors.text }}
        >
          {value}
        </p>
        <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <TrendingUp
            size={16}
            className={isPositive ? 'rotate-0' : 'rotate-180'}
          />
          <span className="ml-1 text-sm">{Math.abs(change)}%</span>
        </div>
      </div>
    </div>
  );
};

const ActivityOverview = ({
  _votesCount,
  _reviewsCount,
  _productsCount,
  _comparisonsCount,
  _likesCount,
  recentActivities = [],
  trends = {},
  activityData = [],
  categoryData = [],
  isPublic = true,
}) => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-6">
{ !isPublic && (
      <div >
      <ActivityVisualizations
        activityData={activityData}
        categoryData={categoryData}
      />
      </div>
      )}

{ !isPublic && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div  className="rounded-lg p-4" style={{ backgroundColor: currentTheme.colors.card }}>
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentActivities.slice(0, 5).map((activity, index) => (
              <RecentActivityCard key={index} activity={activity} />
            ))}
          </div>
        </div>

        <div  className="rounded-lg p-4" style={{ backgroundColor: currentTheme.colors.card }}>
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Activity Trends
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <ActivityTrend
              title="Weekly Activity"
              value={trends.weeklyActivity || 0}
              change={trends.weeklyChange || 0}
            />
            <ActivityTrend
              title="Monthly Growth"
              value={trends.monthlyGrowth || 0}
              change={trends.monthlyChange || 0}
            />
          </div>
        </div>
      </div>
)}
    </div>
  );
};

export default ActivityOverview;
