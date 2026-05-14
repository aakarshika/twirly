import React, { useState, useEffect } from 'react';
import { useBetaTesting } from '../../contexts/BetaTestingContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BetaAnalytics = () => {
  const { isBetaMode } = useBetaTesting();
  const [analyticsData, setAnalyticsData] = useState({
    userActions: [],
    errorRates: [],
    featureUsage: [],
    userEngagement: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Simulated analytics data - replace with actual data fetching
        const data = {
          userActions: [
            { time: '00:00', actions: 10 },
            { time: '04:00', actions: 5 },
            { time: '08:00', actions: 20 },
            { time: '12:00', actions: 30 },
            { time: '16:00', actions: 25 },
            { time: '20:00', actions: 15 },
          ],
          errorRates: [
            { time: '00:00', errors: 2 },
            { time: '04:00', errors: 1 },
            { time: '08:00', errors: 3 },
            { time: '12:00', errors: 4 },
            { time: '16:00', errors: 2 },
            { time: '20:00', errors: 1 },
          ],
          featureUsage: [
            { name: 'Comparisons', value: 40 },
            { name: 'Votes', value: 30 },
            { name: 'Reviews', value: 20 },
            { name: 'Profile', value: 10 },
          ],
          userEngagement: [
            { time: '00:00', engagement: 15 },
            { time: '04:00', engagement: 10 },
            { time: '08:00', engagement: 25 },
            { time: '12:00', engagement: 35 },
            { time: '16:00', engagement: 30 },
            { time: '20:00', engagement: 20 },
          ],
        };
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30000); // Update every 30 seconds

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
        <p>Loading analytics data...</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-4" style={{ paddingTop: '104px' }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Analytics Dashboard</h1>

      {/* User Actions Over Time */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>User Actions Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.userActions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="actions" stroke="var(--color-primary)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Rates */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Error Rates</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.errorRates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="errors" stroke="#FF4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Usage */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Feature Usage</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analyticsData.featureUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.featureUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Engagement */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>User Engagement</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.userEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="engagement" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BetaAnalytics;
