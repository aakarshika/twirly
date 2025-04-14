// File: src/components/comparison/ComparisonGrid.jsx

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import ItemCard from './ItemCard';
import Button from '../common/Button';
import ReviewForm from './ReviewForm';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Grid component to display comparison items
 */
const ComparisonGrid = ({ title, height, currentId }) => {
  
  const { 
    items, 
    userVoted, 
    loadNextSet,
    completedSets,
    currentSetIndex
  } = useComparison();
  // console.log("height in grid",height);

  const { currentTheme } = useTheme();

  const navigate = useNavigate();

  const handleNextPoll = () => {
    if (currentId) {
      navigate(`/comparison/${currentId+1}`);
    }
  };
  // console.log('Height in ComparisonGrid:', height); // Check if height is logged correctly

  // Get the current winner if voting has occurred
  const getWinner = () => {
    if (!userVoted || !items.length) return null;
    return [...items].sort((a, b) => b.votes - a.votes)[0];
  };

  const winner = getWinner();
  const isLastSet = currentSetIndex === 2; // Assuming 3 sets (0-indexed)
  
  const heightValue = height; 

  // Extract the numeric part and convert it to a number
  const numericHeight = parseFloat(heightValue); 
  
  // Divide by 4
  const gap = (numericHeight / 30) + 'vh'; 

  return (
    <div className="space-y-4  m-4" style={{  color: currentTheme.colors.primary }}>
      {/* Poll Title */}

    <div style={{  color: currentTheme.colors.text }}>
      <div className="flex justify-between items-center ">
        
        <span style={{  color: currentTheme.colors.primary }} className="text-lg font-bold text-white">
          {title || 'Untitled Comparison'}
        </span>
      </div>
    </div>


      {/* Items Grid */}
      <div className="grid grid-cols-2" 
        style={{ 
          gap: gap
        }}
      >
        {items.map((item, i) => (
          <ItemCard key={item.id} item={item} i={i} height={height} />
        ))}
      </div>
      
      {/* Results Announcement when voted */}
      {userVoted && winner && (
        <div className="text-center ">
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