// File: src/pages/Comparison.jsx

import React from 'react';
import { useComparison } from '../contexts/ComparisonContext';
import ComparisonGrid from '../components/comparison/ComparisonGrid';
import ResultsPanel from '../components/comparison/ResultsPanel';
import CustomForm from '../components/comparison/CustomForm';
import ReviewModal from '../components/comparison/ReviewModal';

/**
 * Main comparison page component that orchestrates the comparison experience
 */
const Comparison = () => {
  const { customMode, completedSets, activeReviewItem } = useComparison();
  
  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col">
      <main className="p-6 max-w-6xl mx-auto w-full flex-1">
        {/* Show completed results if any exist */}
        {completedSets.length > 0 && !customMode && (
          <ResultsPanel />
        )}
        
        {/* Show either custom form or comparison grid */}
        {customMode ? (
          <CustomForm />
        ) : (
          <ComparisonGrid />
        )}

        {/* Show review modal when active */}
        {activeReviewItem && <ReviewModal />}
      </main>
    </div>
  );
};

export default Comparison;