import React from 'react';

const ReviewSummary = ({ reviews }) => {
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Calculate rating distribution
  const ratingDistribution = {
    5: reviews.filter(review => Math.floor(review.rating) === 5).length,
    4: reviews.filter(review => Math.floor(review.rating) === 4).length,
    3: reviews.filter(review => Math.floor(review.rating) === 3).length,
    2: reviews.filter(review => Math.floor(review.rating) === 2).length,
    1: reviews.filter(review => Math.floor(review.rating) === 1).length
  };

  // Calculate percentage for each rating
  const totalReviews = reviews.length;
  const getPercentage = (count) => totalReviews > 0 ? (count / totalReviews) * 100 : 0;

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="text-4xl font-bold mr-4">{averageRating}</div>
        <div className="flex flex-col">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center">
            <div className="w-12 text-sm text-gray-600">{rating} stars</div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
              <div
                className="h-full bg-yellow-400 rounded-full"
                style={{ width: `${getPercentage(ratingDistribution[rating])}%` }}
              />
            </div>
            <div className="w-12 text-sm text-gray-600">
              {ratingDistribution[rating]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSummary; 