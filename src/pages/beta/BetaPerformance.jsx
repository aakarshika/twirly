import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useBetaTesting } from '../../contexts/BetaTestingContext';
import { getPerformanceReport } from '../../utils/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BetaPerformance = () => {
  const { currentTheme } = useTheme();
  const { isBetaMode } = useBetaTesting();
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const report = await getPerformanceReport();
        setPerformanceData(report);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isBetaMode) {
    return (
      <div className="p-4 text-center">
        <p>Beta testing features are only available in beta mode.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ paddingTop: '104px' }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Performance Monitor</h1>
      
      {/* App Launch Time */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>App Launch Time</h2>
        <div className="bg-opacity-10 rounded-lg p-4" style={{ backgroundColor: 'var(--color-primary)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {performanceData?.appLaunchTime || 0}ms
          </p>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Memory Usage</h2>
        <div className="bg-opacity-10 rounded-lg p-4" style={{ backgroundColor: 'var(--color-primary)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {performanceData?.memoryUsage || 0}MB
          </p>
        </div>
      </div>

      {/* API Response Times */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>API Response Times</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData?.apiResponseTimes || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="endpoint" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="time" fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Screen Transition Times */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Screen Transition Times</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData?.screenTransitions || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="screen" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="time" fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BetaPerformance; 