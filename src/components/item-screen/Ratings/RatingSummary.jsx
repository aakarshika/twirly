import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const RatingSummary = ({ item }) => {
  const { currentTheme } = useTheme();
  const rating = item.rating || 0;
  const reviewCount = item.review_count || 0;

  return (
    <div className="text-center space-y-4">
      <div className="text-5xl font-bold" style={{ color: currentTheme.colors.text }}>
        {rating.toFixed(1)}
      </div>
      <div className="flex justify-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-6 h-6 ${
              i < Math.floor(rating)
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
      <p className="text-sm" style={{ color: currentTheme.colors.text }}>
        Based on {reviewCount} reviews
      </p>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">5 stars</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${(item.five_star_count / reviewCount) * 100}%` }}
            />
          </div>
          <span className="text-sm">{item.five_star_count || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">4 stars</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${(item.four_star_count / reviewCount) * 100}%` }}
            />
          </div>
          <span className="text-sm">{item.four_star_count || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">3 stars</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${(item.three_star_count / reviewCount) * 100}%` }}
            />
          </div>
          <span className="text-sm">{item.three_star_count || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">2 stars</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${(item.two_star_count / reviewCount) * 100}%` }}
            />
          </div>
          <span className="text-sm">{item.two_star_count || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">1 star</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${(item.one_star_count / reviewCount) * 100}%` }}
            />
          </div>
          <span className="text-sm">{item.one_star_count || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingSummary; 