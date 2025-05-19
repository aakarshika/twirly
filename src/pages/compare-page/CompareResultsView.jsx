import React from 'react';
import PollScreen from '../comparison-results-page/PollScreen';




const CompareResultsView = ({items, currentSetId, currentSet}) => {
  console.log('CompareResultsView');
  console.log('items', items);
  console.log('currentSetId', currentSetId);
  console.log('currentSet', currentSet);
  return (
    <div>
      <PollScreen items={items} currentSetId={currentSetId} currentSet={currentSet} />
    </div>
  );
};

export default CompareResultsView; 