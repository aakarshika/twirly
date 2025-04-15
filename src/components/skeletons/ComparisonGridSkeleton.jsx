import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ComparisonGridSkeleton = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-4 m-4">
      {/* Title Skeleton */}
      <div className="flex justify-between items-center">
        <div
          className="h-6 w-48 rounded animate-pulse"
          style={{
            backgroundColor: currentTheme.colors.muted,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden transition-all duration-300"
            style={{
              background: currentTheme.colors.card,
              height: '40vh'
            }}
          >

            {/* Content placeholder */}
            <div className="p-4 space-y-3">

              {/* Skeleton for Title */}
              <div className="h-6 bg-gray-300 rounded mb-4 w-3/4" style={{ backgroundColor: currentTheme.colors.background }}></div>

              {/* Skeleton for Images */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative w-full h-48 bg-gray-300 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}></div>
                </div>
              </div>
              <div className="h-6 bg-gray-300 rounded mb-4 w-3/4"  style={{ backgroundColor: currentTheme.colors.background }}></div>
              <div className="h-6 bg-gray-300 rounded mb-4 w-30"  style={{ backgroundColor: currentTheme.colors.background }}></div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonGridSkeleton; 