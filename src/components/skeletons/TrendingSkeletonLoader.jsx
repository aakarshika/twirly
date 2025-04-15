import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
const TrendingSkeletonLoader = () => {
  const { currentTheme } = useTheme();

  return (
    // Don't wrap in any container, just return the items
    [...Array(4)].map((_, index) => (
      <div
        style={{ backgroundColor: currentTheme.colors.card }}
        key={index}
        className="rounded-xl overflow-hidden border border-gray-300 hover:transform hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
      >
        <div className="p-6">
          {/* Skeleton for Category and Time */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 bg-gray-300 rounded w-1/4" style={{ backgroundColor: currentTheme.colors.background }}></div>
            <div className="h-4 bg-gray-300 rounded w-1/4" style={{ backgroundColor: currentTheme.colors.background }}></div>
          </div>

          {/* Skeleton for Title */}
          <div className="h-6 bg-gray-300 rounded mb-4 w-3/4" style={{ backgroundColor: currentTheme.colors.background }}></div>

          {/* Skeleton for Images */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative w-full h-48 bg-gray-300 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}></div>
            </div>
            <div className="flex-1">
              <div className="relative w-full h-48 bg-gray-300 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}></div>
            </div>
          </div>

          {/* Skeleton for Votes and Participants */}
          <div className="flex justify-between items-center text-gray-400">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"  style={{ backgroundColor: currentTheme.colors.background }}></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"  style={{ backgroundColor: currentTheme.colors.background }}></div>
            </div>
          </div>
        </div>
      </div>
    ))
  );
};

export default TrendingSkeletonLoader;
