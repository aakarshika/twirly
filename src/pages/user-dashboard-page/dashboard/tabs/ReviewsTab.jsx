import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getUserReviews } from '../../../../services/reviews';
import { useAuth } from '../../../../contexts/AuthContext';
import ReviewCard from './ReviewCard';
import { useLoading } from '../../../../contexts/LoadingContext';

const ReviewsTab = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const { setLoading, setError: setGlobalError } = useLoading();

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) {
        setError('You must be logged in to view your reviews');
        setLoading('global', false);
        return;
      }

      try {
        setLoading('global', true, 'Loading reviews...');
        const data = await getUserReviews(user.id);
        setReviews(data);
      } catch (err) {
        setError('Failed to fetch reviews');
        setGlobalError('global', err.message, () => window.location.reload());
        console.error(err);
      } finally {
        setLoading('global', false);
      }
    };

    fetchReviews();
  }, [user]);

  if (error) {
    return null; // Error screen is now handled by LoadingContext
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

export default ReviewsTab; 