import React from 'react';
import { useBetaTesting } from '../../contexts/BetaTestingContext';
import { Monitor, MessageSquare } from 'lucide-react';

const BetaTestingControls = () => {
  const {
    isBetaMode,
    showPerformanceMonitor,
    togglePerformanceMonitor,
    openBetaFeedback,
  } = useBetaTesting();

  if (!isBetaMode) return null;

  return (
    <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-50">
      {/* <button
        onClick={togglePerformanceMonitor}
        className={`p-2 rounded-full shadow-lg transition-colors ${
          showPerformanceMonitor ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
        title="Toggle Performance Monitor"
      >
        <Monitor size={20} />
      </button>
       */}
      {/* <button
        onClick={openBetaFeedback}
        className="p-2 mb-10 rounded-full shadow-lg transition-colors bg-gray-500 text-white hover:bg-blue-600"
        title="Submit Beta Feedback"
      >
        <MessageSquare size={20} />
      </button> */}
    </div>
  );
};

export default BetaTestingControls; 