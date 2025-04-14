import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getUserReviews } from '../../../services/reviews';
import ReviewCard from './ReviewCard';
import { TEMP_USER_ID } from '../../../lib/constants';

const ReviewsTab = ({  }) => {
  const { currentTheme } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    const fetchReviews = async () => {
      try {
        const data = await getUserReviews(TEMP_USER_ID);
        setReviews(data);
      } catch (err) {
        setError('Failed to fetch reviews');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [TEMP_USER_ID]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-xl font-bold"
          style={{ color: currentTheme.colors.text }}
        >
          Your Reviews
        </h2>
        <button
          className="px-4 py-2 rounded-lg font-medium"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.buttonText
          }}
        >
          Write New Review
        </button>
      </div>

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div 
            className="text-center p-8"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            No reviews yet. Start writing your first review!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsTab; 