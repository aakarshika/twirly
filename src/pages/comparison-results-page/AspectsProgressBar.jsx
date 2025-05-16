import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { splitAndJoin } from '../../lib/utils';

const AspectBox = ({ aspect, isPlayed, isResults, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex-shrink-0 w-32 h-32 mx-2 rounded-xl shadow-md cursor-pointer
        ${isResults 
          ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
          : isPlayed 
            ? 'bg-gradient-to-br from-green-400 to-green-600' 
            : 'bg-gradient-to-br from-gray-200 to-gray-400'
        }
        flex flex-col items-center justify-center p-4 relative
      `}
    >
      {isPlayed && !isResults && (
        <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-white" />
      )}
      <span className="text-white font-medium text-center">
        {isResults ? 'Results' : splitAndJoin(aspect.metric_name)}
      </span>
      {isResults && (
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute -top-2 -right-2 bg-yellow-300 rounded-full p-1"
        >
          <ChevronRight className="w-4 h-4 text-amber-800" />
        </motion.div>
      )}
    </motion.div>
  );
};

const AspectsProgressBar = ({ comparisonMetrics, playedAspects, onAspectClick }) => {
  const scrollContainerRef = useRef(null);

  // Sort metrics: unplayed first, then played, results last
  const sortedMetrics = [...comparisonMetrics].sort((a, b) => {
    return a.userVoted ? -1 : 1;
  });

  useEffect(() => {
    // Find the first unvoted aspect and scroll to it
    if (scrollContainerRef.current) {
      const firstUnvotedIndex = sortedMetrics.findIndex(metric => !metric.userVoted);
      if (firstUnvotedIndex !== -1) {
        const aspectWidth = 144; // 32 (width) + 16 (mx-2) = 48 * 3 (to center it)
        scrollContainerRef.current.scrollLeft = firstUnvotedIndex * aspectWidth;
      }
      else {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      }

    }
  }, [sortedMetrics]);

  return (
    <div className="w-full overflow-hidden py-4">
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-4 px-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {sortedMetrics.map((aspect) => (
          <AspectBox
            key={aspect.id}
            aspect={aspect}
            isPlayed={aspect.userVoted}
            isResults={false}
            onClick={() => onAspectClick(aspect)}
          />
        ))}
        <AspectBox
          aspect={{ metric_name: 'Results' }}
          isPlayed={true}
          isResults={true}
          onClick={() => onAspectClick({ id: 'results' })}
        />
      </div>
    </div>
  );
};

export default AspectsProgressBar; 