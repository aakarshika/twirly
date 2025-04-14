import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { CombinedBarChart } from '../../results/visualizations';
import ActivityVisualizations from '../../dashboard/ActivityVisualizations';
import Metrics from '../../common/Metrics';

const MetricsTab = ({ item, activityData, categoryData }) => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Detailed Metrics</h3>
          <div className="space-y-4">
            <Metrics metrics={item.averageMetrics} />
            <div className="mt-6">
              <CombinedBarChart items={[item]} />
            </div>
          </div>
        </div>
        <div className="p-6 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Category Distribution</h3>
          <ActivityVisualizations 
            activityData={activityData}
            categoryData={categoryData}
          />
        </div>
      </div>
    </div>
  );
};

export default MetricsTab; 