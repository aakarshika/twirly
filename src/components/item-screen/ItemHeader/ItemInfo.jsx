import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const ItemInfo = ({ item }) => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>
          {item.name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          by {item.company_name || 'Unknown Brand'}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(item.rating || 0)
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
        <span className="text-sm" style={{ color: currentTheme.colors.text }}>
          {item.rating?.toFixed(1) || '0.0'} ({item.review_count || 0} reviews)
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
          Highlights
        </h2>
        <ul className="list-disc list-inside space-y-1">
          {item.highlights?.map((highlight, index) => (
            <li key={index} className="text-sm" style={{ color: currentTheme.colors.text }}>
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ItemInfo; 