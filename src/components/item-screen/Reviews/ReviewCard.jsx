import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const ReviewCard = ({ review, isExpanded, onExpand }) => {
  const { currentTheme } = useTheme();
  const [isHelpful, setIsHelpful] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(review.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="font-medium" style={{ color: currentTheme.colors.text }}>
              {review.user?.username || 'Reviewer'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {formatDate(review.created_at)}
          </p>
        </div>
        <button
          onClick={() => setIsHelpful(!isHelpful)}
          className="flex items-center space-x-1 text-sm"
        >
          <svg
            className={`w-4 h-4 ${isHelpful ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>{(review.helpful_count || 0) + (isHelpful ? 1 : 0)}</span>
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <p
          className={`text-sm ${!isExpanded && 'line-clamp-3'}`}
          style={{ color: currentTheme.colors.text }}
        >
          {review.comment}
        </p>
        {review.comment?.length > 200 && (
          <button
            onClick={onExpand}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {review.images && review.images.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {review.images.map((image, index) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden">
              <img
                src={image}
                alt={`Review image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  if (e.target.src !== 'https://fakeimg.pl/600x400?text=img') {
                    e.target.src = 'https://fakeimg.pl/600x400?text=img';
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard; 