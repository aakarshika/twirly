import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Metrics from '../../common/Metrics';
import { ArrowTrendingUpIcon as TrendingUpIcon } from '@heroicons/react/24/solid';

const OverviewTab = ({ item, recentActivities }) => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Performance Overview</h3>
          <Metrics metrics={item?.item_metric_averages} />
        </div>
        <div className="p-6 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities?.map((activity, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: currentTheme.colors.primary + '20' }}
                >
                  <TrendingUpIcon className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                    {activity.description}
                  </p>
                  <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!recentActivities || recentActivities.length === 0) && (
              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                No recent activity to display
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab; 