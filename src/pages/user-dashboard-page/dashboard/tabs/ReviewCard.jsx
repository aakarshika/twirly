import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getUserReviews } from '../../../../services/reviews';

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
              {review.rating.toFixed(1)}/5
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
              {new Date(review.created_at).toLocaleDateString()}
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

export default ReviewCard;