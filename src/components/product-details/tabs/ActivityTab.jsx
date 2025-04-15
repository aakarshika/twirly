import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import ActivityVisualizations from '../../dashboard/ActivityVisualizations';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/solid';

const ActivityTab = ({ activityData, categoryData, recentActivities, trends }) => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      </div>
    </div>
  );
};

export default ActivityTab; 