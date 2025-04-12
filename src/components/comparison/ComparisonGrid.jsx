// File: src/components/comparison/ComparisonGrid.jsx

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import ItemCard from './ItemCard';
import Button from '../common/Button';
import ReviewForm from './ReviewForm';

/**
 * Grid component to display comparison items
 */
const ComparisonGrid = ({ title }) => {
  const { 
    items, 
    userVoted, 
    loadNextSet,
    completedSets,
    currentSetIndex
  } = useComparison();

  console.log('ComparisonGrid received title:', title);

  // Get the current winner if voting has occurred
  const getWinner = () => {
    if (!userVoted || !items.length) return null;
    return [...items].sort((a, b) => b.votes - a.votes)[0];
  };

  const winner = getWinner();
  const isLastSet = currentSetIndex === 2; // Assuming 3 sets (0-indexed)
  
  return (
    <div className="space-y-8">
      {/* Poll Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          {title || 'Untitled Comparison'}
        </h1>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      
      {/* Results Announcement when voted */}
      {userVoted && winner && (
        <div className="border border-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Results</h2>
          <p className="mb-3">
            The winner is: <strong>{winner.name}</strong> with {winner.votes} votes!
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Don't agree? Add your review to share your opinion!
          </p>
        </div>
      )}
      
      {/* Review Form Modal */}
      <ReviewForm />
    </div>
  );
  
  // Helper function to get the next category name
  function getNextCategory() {
    const categories = ['Shoes', 'Social Media', 'Fast Food'];
    const nextIndex = (currentSetIndex + 1) % categories.length;
    return categories[nextIndex];
  }
};

export default ComparisonGrid;