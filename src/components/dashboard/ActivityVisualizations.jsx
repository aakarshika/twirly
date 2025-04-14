import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { BarChart, PieChart } from 'lucide-react';

const ActivityChart = ({ data }) => {
  const { currentTheme } = useTheme();
  
  // Find maximum values for each activity type
  const maxValues = {
    activity: Math.max(...data.map(item => item.activity_count)),
    votes: Math.max(...data.map(item => item.votes_count)),
    reviews: Math.max(...data.map(item => item.reviews_count)),
    comparisons: Math.max(...data.map(item => item.comparisons_count))
  };
  
  const activityColors = {
    activity: currentTheme.colors.primary,
    votes: '#4CAF50', // Green
    reviews: '#2196F3', // Blue
    comparisons: '#FF9800' // Orange
  };
  
  return (
    <div 
      className="p-4 rounded-lg"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="text-lg font-medium"
          style={{ color: currentTheme.colors.text }}
        >
          Activity Over Time
        </h3>
        <BarChart 
          size={20} 
          style={{ color: currentTheme.colors.primary }} 
        />
      </div>
      
      <div className="h-48 flex items-end space-x-1">
        {data.map((item, index) => (
          <div 
            key={index}
            className="flex-1 flex items-end space-x-1 group relative"
          >
            {/* Comparisons */}
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="w-full rounded-t hover:opacity-100 transition-opacity"
                style={{ 
                  height: `${(item.comparisons_count / maxValues.comparisons) * 100}px`,
                  backgroundColor: activityColors.comparisons,
                  opacity: item.comparisons_count > 0 ? 0.8 : 0,
                  minHeight: '1px'
                }}
              />
            </div>
            
            {/* Reviews */}
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="w-full rounded-t hover:opacity-100 transition-opacity"
                style={{ 
                  height: `${(item.reviews_count / maxValues.reviews) * 100}px`,
                  backgroundColor: activityColors.reviews,
                  opacity: item.reviews_count > 0 ? 0.8 : 0,
                  minHeight: '1px'
                }}
              />
            </div>
            
            {/* Votes */}
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="w-full rounded-t hover:opacity-100 transition-opacity"
                style={{ 
                  height: `${(item.votes_count / maxValues.votes) * 100}px`,
                  backgroundColor: activityColors.votes,
                  opacity: item.votes_count > 0 ? 0.8 : 0,
                  minHeight: '1px'
                }}
              />
            </div>
            
            {/* General Activity */}
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="w-full rounded-t hover:opacity-100 transition-opacity"
                style={{ 
                  height: `${(item.activity_count / maxValues.activity) * 100}px`,
                  backgroundColor: activityColors.activity,
                  opacity: item.activity_count > 0 ? 0.8 : 0,
                  minHeight: '1px'
                }}
              />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-10 whitespace-nowrap">
              <div className="mb-1 font-medium">{item.day_name}</div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: activityColors.activity }} />
                <span>Activities: {item.activity_count}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: activityColors.votes }} />
                <span>Votes: {item.votes_count}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: activityColors.reviews }} />
                <span>Reviews: {item.reviews_count}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: activityColors.comparisons }} />
                <span>Comparisons: {item.comparisons_count}</span>
              </div>
            </div>
            
            <p 
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {item.day_name}
            </p>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-8">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: activityColors.activity }} />
          <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>Activities</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: activityColors.votes }} />
          <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>Votes</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: activityColors.reviews }} />
          <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>Reviews</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: activityColors.comparisons }} />
          <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>Comparisons</span>
        </div>
      </div>
    </div>
  );
};

const CategoryDistribution = ({ data }) => {
  const { currentTheme } = useTheme();
  
  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div 
      className="p-4 rounded-lg"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="text-lg font-medium"
          style={{ color: currentTheme.colors.text }}
        >
          Category Distribution
        </h3>
        <PieChart 
          size={20} 
          style={{ color: currentTheme.colors.primary }} 
        />
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span 
                  className="text-sm"
                  style={{ color: currentTheme.colors.text }}
                >
                  {item.label}
                </span>
                <span 
                  className="text-sm"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {percentage}%
                </span>
              </div>
              <div 
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: currentTheme.colors.border }}
              >
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: currentTheme.colors.primary
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ActivityVisualizations = ({ 
  activityData = [],
  categoryData = []
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ActivityChart data={activityData} />
      <CategoryDistribution data={categoryData} />
    </div>
  );
};

export default ActivityVisualizations; 