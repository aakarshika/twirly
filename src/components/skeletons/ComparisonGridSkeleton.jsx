import React from 'react';

const ComparisonGridSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900">
          <div className="relative h-48 bg-gray-800 animate-pulse" />
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="h-6 bg-gray-800 rounded animate-pulse" />
              <div className="h-4 bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="h-4 bg-gray-800 rounded animate-pulse w-1/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ComparisonGridSkeleton; 