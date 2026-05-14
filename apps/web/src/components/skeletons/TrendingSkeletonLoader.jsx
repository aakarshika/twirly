import React from 'react';

const TrendingSkeletonLoader = ({ count = 6 }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="rounded-lg overflow-hidden bg-surface border border-border animate-pulse"
      >
        <div className="h-32 bg-surface-elevated" />
        <div className="px-3 pt-2 pb-3 space-y-2">
          <div className="h-3 bg-surface-elevated rounded w-3/4" />
          <div className="h-2.5 bg-surface-elevated rounded w-1/3" />
          <div className="flex items-center justify-between mt-3">
            <div className="h-2 bg-surface-elevated rounded w-24" />
            <div className="h-2 bg-surface-elevated rounded w-12" />
          </div>
        </div>
      </div>
    ))}
  </>
);

export default TrendingSkeletonLoader;
