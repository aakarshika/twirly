import React, { useEffect, useState } from 'react';
import { getPerformanceReport } from '../utils/analytics';

const PerformanceMonitor = ({ isVisible = false }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setMetrics(getPerformanceReport());
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg shadow-lg z-50 text-sm">
      <h3 className="font-bold mb-2">Performance Metrics</h3>
      <div className="space-y-2">
        <div>
          <span className="font-semibold">App Launch:</span>{' '}
          {metrics.appLaunchTime?.toFixed(2)}ms
        </div>
        <div>
          <span className="font-semibold">Memory Usage:</span>{' '}
          {(metrics.resourceUsage.memory / 1024 / 1024).toFixed(2)}MB
        </div>
        <div>
          <span className="font-semibold">API Response Times:</span>
          <ul className="ml-4">
            {Object.entries(metrics.averageApiResponseTimes).map(([url, time]) => (
              <li key={url}>
                {url.split('/').pop()}: {time.toFixed(2)}ms
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="font-semibold">Screen Transitions:</span>
          <ul className="ml-4">
            {Object.entries(metrics.screenTransitionTimes).map(([transition, time]) => (
              <li key={transition}>
                {transition}: {time.toFixed(2)}ms
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
