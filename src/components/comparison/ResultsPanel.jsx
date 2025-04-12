// File: src/components/comparison/ResultsPanel.jsx

import React from 'react';
import { Trophy } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';

/**
 * Component to display previous comparison results
 */
const ResultsPanel = () => {
  const { completedSets } = useComparison();
  
  if (!completedSets.length) {
    return null;
  }
  
  return (
    <div className="mb-8 border border-gray-800 rounded-lg p-5">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Trophy size={18} className="mr-2 text-amber-400" />
        Previous Results
      </h2>
      
      <div className="flex flex-wrap gap-4">
        {completedSets.map((set, index) => (
          <ResultCard key={index} resultSet={set} />
        ))}
      </div>
    </div>
  );
};

/**
 * Card component for a single result
 */
const ResultCard = ({ resultSet }) => {
  const { category, winner } = resultSet;
  
  return (
    <div className="border border-gray-800 rounded-lg p-4 flex-1 min-w-[200px]">
      <h3 className="font-medium text-gray-300">{category}</h3>
      <p className="text-sm mt-1">
        Winner: <span className="text-white font-semibold">{winner.name}</span>
      </p>
      
      {/* Display the winner's top metric */}
      {winner.metrics && Object.entries(winner.metrics).length > 0 && (
        <div className="mt-2 text-xs text-gray-400">
          {getTopMetric(winner.metrics)}
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to get the top metric from an item
 */
function getTopMetric(metrics) {
  if (!metrics || Object.keys(metrics).length === 0) {
    return null;
  }
  
  // Find the metric with the highest value
  const entries = Object.entries(metrics);
  const [topMetric, topValue] = entries.reduce(
    (highest, current) => current[1] > highest[1] ? current : highest,
    entries[0]
  );
  
  return `Top rated for ${topMetric}: ${topValue.toFixed(1)}/10`;
}

export default ResultsPanel;