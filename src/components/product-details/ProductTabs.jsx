import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import OverviewTab from './tabs/OverviewTab';
import ReviewsTab from './tabs/ReviewsTab';
import AppearancesTab from './tabs/AppearancesTab';
import MetricsTab from './tabs/MetricsTab';
import ActivityTab from './tabs/ActivityTab';

const ProductTabs = ({ 
  activeTab, 
  setActiveTab, 
  item, 
  reviews, 
  comparisonSets, 
  activityData, 
  categoryData, 
  recentActivities, 
  trends 
}) => {
  const { currentTheme } = useTheme();

  return (
    <div className="mb-8">
      <div className="flex space-x-4 border-b border-gray-700">
        {['overview', 'reviews', 'appearances', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            style={{ color: activeTab === tab ? currentTheme.colors.primary : currentTheme.colors.textSecondary }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === 'overview' && (
          <OverviewTab 
            item={item}
            recentActivities={recentActivities}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab 
            reviews={reviews}
            item={item}
          />
        )}

        {activeTab === 'appearances' && (
          <AppearancesTab 
            comparisonSets={comparisonSets}
            item={item}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTab 
            activityData={activityData}
            categoryData={categoryData}
            trends={trends}
          />
        )}
      </div>
    </div>
  );
};

export default ProductTabs; 