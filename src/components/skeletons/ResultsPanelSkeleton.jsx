import React from 'react';

const ResultsPanelSkeleton = () => (
  <div className="border border-gray-800 rounded-lg p-6 mb-8">
    <div className="h-8 bg-gray-800 rounded animate-pulse w-1/4 mb-4" />
    <div className="h-6 bg-gray-800 rounded animate-pulse w-1/2 mb-2" />
    <div className="h-4 bg-gray-800 rounded animate-pulse w-1/3" />
  </div>
);

export default ResultsPanelSkeleton; 