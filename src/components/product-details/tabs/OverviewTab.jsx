import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Metrics from '../../common/Metrics';
import { TrendingUpIcon } from 'lucide-react';
const OverviewTab = ({ item, recentActivities ,activityData, categoryData,  trends}) => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Performance Overview</h3>
          <Metrics metrics={item?.item_metric_averages} />
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Trend Analysis</h3>
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
                    { activity.activity_type == "vote" ? 'Someone voted for your item! Yay!' : activity.description }
                  </p>
                  <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!recentActivities || recentActivities.length === 0) && (
              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                No recent activities to display
              </p>
            )}
          </div>
          {trends && (
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
              <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text }}>Weekly Activity Trends</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.textSecondary }}>Current Week</span>
                  <span style={{ color: currentTheme.colors.text }}>{trends.current_week_activity || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.textSecondary }}>Previous Week</span>
                  <span style={{ color: currentTheme.colors.text }}>{trends.previous_week_activity || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.textSecondary }}>Change</span>
                  <span 
                    style={{ 
                      color: trends.weekly_change_percentage >= 0 
                        ? currentTheme.colors.success 
                        : currentTheme.colors.error 
                    }}
                  >
                    {trends.weekly_change_percentage >= 0 ? '+' : ''}{trends.weekly_change_percentage || 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab; 