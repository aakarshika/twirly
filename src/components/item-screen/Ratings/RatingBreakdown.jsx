import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const RatingBreakdown = ({ reviews }) => {
  const { currentTheme } = useTheme();

  // Calculate average ratings for different aspects
  const calculateAverage = (aspect) => {
    const total = reviews.reduce((sum, review) => sum + (review[aspect] || 0), 0);
    return reviews.length ? (total / reviews.length).toFixed(1) : '0.0';
  };

  const aspects = [
    { key: 'quality', label: 'Quality' },
    { key: 'value', label: 'Value for Money' },
    { key: 'performance', label: 'Performance' },
    { key: 'design', label: 'Design' },
    { key: 'ease_of_use', label: 'Ease of Use' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {aspects.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium" style={{ color: currentTheme.colors.text }}>
                {label}
              </span>
              <span className="text-sm" style={{ color: currentTheme.colors.text }}>
                {calculateAverage(key)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(calculateAverage(key))
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
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium" style={{ color: currentTheme.colors.text }}>
          What Customers Say
        </h3>
        <div className="space-y-4">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
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
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                  {review.user?.username || 'Anonymous'}
                </span>
              </div>
              <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingBreakdown; 