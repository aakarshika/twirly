import React from 'react';
import RatingSummary from './RatingSummary';
import RatingBreakdown from './RatingBreakdown';

const Ratings = ({ item, reviews }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <RatingSummary item={item} />
        </div>
        <div className="md:col-span-2">
          <RatingBreakdown reviews={reviews} />
        </div>
      </div>
    </div>
  );
};

export default Ratings; 