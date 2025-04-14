import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import ReviewCard from './ReviewCard';

const ReviewList = ({ reviews }) => {
  const { currentTheme } = useTheme();
  const [expandedReview, setExpandedReview] = useState(null);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: currentTheme.colors.text }}>
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          isExpanded={expandedReview === review.id}
          onExpand={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
        />
      ))}
    </div>
  );
};

export default ReviewList; 