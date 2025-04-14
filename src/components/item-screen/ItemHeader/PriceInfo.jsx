import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const PriceInfo = ({ item }) => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>
            ${item.price?.toFixed(2) || '0.00'}
          </span>
          {item.original_price && item.original_price > item.price && (
            <span className="text-sm text-gray-500 line-through">
              ${item.original_price.toFixed(2)}
            </span>
          )}
        </div>
        {item.shipping_info && (
          <p className="text-sm text-gray-500">
            {item.shipping_info}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <button
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add to Comparison
        </button>
      </div>

      <div className="text-sm space-y-1">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          In Stock
        </p>
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Free Returns
        </p>
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Secure Payment
        </p>
      </div>
    </div>
  );
};

export default PriceInfo; 