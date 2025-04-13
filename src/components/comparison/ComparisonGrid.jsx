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
const ComparisonGrid = ({ title,nextPollId, height }) => {
  
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
    if (nextPollId) {
      navigate(`/comparison/${nextPollId}`);
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
  
  return (
    <div className="space-y-4  m-4" style={{  color: currentTheme.colors.primary }}>
      {/* Poll Title */}

    <div style={{  color: currentTheme.colors.text }}>
      <div className="flex justify-between items-center ">
        <button
          onClick={() => navigate(-1)}
          className="flex text-sm items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        
        <span style={{  color: currentTheme.colors.primary }} className="text-lg font-bold text-white">
          {title || 'Untitled Comparison'}
        </span>
        {nextPollId && (
          <button
            onClick={handleNextPoll}
            className="flex text-sm items-center gap-2 px-2 py-1 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Next Poll
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>


      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-6">
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