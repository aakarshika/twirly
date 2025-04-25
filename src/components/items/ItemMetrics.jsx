import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ItemMetrics = ({ itemId }) => {
  const { theme } = useTheme();

  // This would be fetched from your API
  const metrics = {
    performance: {
      totalVotes: 1250,
      winRate: 75,
      averageRating: 4.5,
      totalComparisons: 50
    },
    descriptors: [
      { word: 'Reliable', score: 95 },
      { word: 'Durable', score: 90 },
      { word: 'Innovative', score: 85 },
      { word: 'User-friendly', score: 80 },
      { word: 'Efficient', score: 75 }
    ]
  };

  const MetricCard = ({ title, value, unit = '' }) => (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        {title}
      </h4>
      <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {value}{unit}
      </p>
    </div>
  );

  const DescriptorCard = ({ word, score }) => (
    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <div className="flex justify-between items-center">
        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {word}
        </span>
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {score}%
        </span>
      </div>
      <div className={`w-full h-1.5 rounded-full overflow-hidden mt-2 ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div
          className={`h-full ${theme === 'dark' ? 'bg-green-500' : 'bg-green-400'}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Performance Metrics
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard title="Total Votes" value={metrics.performance.totalVotes} />
          <MetricCard title="Win Rate" value={metrics.performance.winRate} unit="%" />
          <MetricCard title="Average Rating" value={metrics.performance.averageRating} />
          <MetricCard title="Total Comparisons" value={metrics.performance.totalComparisons} />
        </div>
      </div>

      <div>
        <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Top Descriptors
        </h2>
        <div className="space-y-3">
          {metrics.descriptors.map((descriptor, index) => (
            <DescriptorCard
              key={index}
              word={descriptor.word}
              score={descriptor.score}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemMetrics; 