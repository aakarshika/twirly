import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const ReviewCard = ({ review }) => {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 
              className="font-semibold text-lg"
              style={{ color: currentTheme.colors.text }}
            >
              {review.productName}
            </h3>
            <p 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {review.category}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span 
              className="text-sm font-medium"
              style={{ color: currentTheme.colors.text }}
            >
              {review.rating}/5
            </span>
            <span className="text-yellow-500">★</span>
          </div>
        </div>
        
        <p 
          className="mb-4"
          style={{ color: currentTheme.colors.text }}
        >
          {review.text}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {review.likes} likes
            </span>
            <span 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {review.comments} comments
            </span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span className="text-sm">✏️</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span className="text-sm">🗑️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsTab = () => {
  const { currentTheme } = useTheme();

  // Mock data - replace with actual data from your backend
  const reviews = [
    {
      id: 1,
      productName: 'iPhone 13 Pro',
      category: 'Electronics',
      rating: 4.5,
      text: 'Great phone with amazing camera quality. Battery life could be better though.',
      likes: 45,
      comments: 12,
      created_at: '2024-03-15'
    },
    {
      id: 2,
      productName: 'MacBook Pro',
      category: 'Electronics',
      rating: 5.0,
      text: 'Perfect for professional work. The M1 chip is a game changer.',
      likes: 78,
      comments: 23,
      created_at: '2024-03-10'
    },
    // Add more mock reviews as needed
  ];

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
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewsTab; 