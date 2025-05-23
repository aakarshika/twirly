import React from 'react';
import PollScreen from '../comparison-results-page/PollScreen';

const CompareResultsView = ({ items, currentSetId, currentSet, celebratingResults }) => {
  if (!items || !currentSetId || !currentSet) {
    return (
      <div className="min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PollScreen 
        items={items} 
        currentSetId={currentSetId} 
        currentSet={currentSet} 
        celebratingResults={celebratingResults}
      />
    </div>
  );
};

export default CompareResultsView; 