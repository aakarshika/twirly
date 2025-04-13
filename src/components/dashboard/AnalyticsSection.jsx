import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AnalyticsCard = ({ title, children }) => {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="p-6 rounded-lg"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <h3 
        className="text-lg font-semibold mb-4"
        style={{ color: currentTheme.colors.text }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
};

const AnalyticsSection = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h2 
        className="text-2xl font-bold"
        style={{ color: currentTheme.colors.text }}
      >
        Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsCard title="Activity Overview">
          <div className="h-64 flex items-center justify-center">
            <p style={{ color: currentTheme.colors.textSecondary }}>
              Activity chart will be displayed here
            </p>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Category Distribution">
          <div className="h-64 flex items-center justify-center">
            <p style={{ color: currentTheme.colors.textSecondary }}>
              Category distribution chart will be displayed here
            </p>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Engagement Metrics">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span style={{ color: currentTheme.colors.textSecondary }}>Average Views</span>
              <span style={{ color: currentTheme.colors.text }}>1,234</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: currentTheme.colors.textSecondary }}>Average Votes</span>
              <span style={{ color: currentTheme.colors.text }}>567</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: currentTheme.colors.textSecondary }}>Average Reviews</span>
              <span style={{ color: currentTheme.colors.text }}>89</span>
            </div>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Recent Activity">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span style={{ color: currentTheme.colors.text }}>New product added</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span style={{ color: currentTheme.colors.text }}>Comparison created</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span style={{ color: currentTheme.colors.text }}>Review received</span>
            </div>
          </div>
        </AnalyticsCard>
      </div>
    </div>
  );
};

export default AnalyticsSection; 