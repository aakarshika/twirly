// File: src/components/comparison/ComparisonGrid.jsx

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import ItemCard from './ItemCard';
import Button from '../common/Button';
import ReviewForm from './ReviewForm';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Grid component to display comparison items
 */
const ComparisonGrid = ({ title, height }) => {
  const { 
    items, 
    userVoted, 
    loadNextSet,
    completedSets,
    currentSetIndex
  } = useComparison();
  console.log("height in grid",height);

  const { currentTheme } = useTheme();

  console.log('Height in ComparisonGrid:', height); // Check if height is logged correctly

  // Get the current winner if voting has occurred
  const getWinner = () => {
    if (!userVoted || !items.length) return null;
    return [...items].sort((a, b) => b.votes - a.votes)[0];
  };

  const winner = getWinner();
  const isLastSet = currentSetIndex === 2; // Assuming 3 sets (0-indexed)
  
  return (
    <div className="space-y-8  m-4" style={{  color: currentTheme.colors.primary }}>
      {/* Poll Title */}
      <div className="text-center mb-8">
        <h1 style={{  color: currentTheme.colors.primary }} className="text-3xl font-bold text-white">
          {title || 'Untitled Comparison'}
        </h1>
      </div>


      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-6">
        {items.map((item, i) => (
          <ItemCard key={item.id} item={item} i={i} height={height} />
        ))}
      </div>
      
      {/* Results Announcement when voted */}
      {userVoted && winner && (
        <div className="text-center mb-8">
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