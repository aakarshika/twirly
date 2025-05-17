import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2, Sparkles, BarChart, CheckCircle } from 'lucide-react';
import { splitAndJoin } from '../../lib/utils';

const VoteCelebration = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute right-0 top-0 transform -translate-x-1/2 -translate-y-1/2 z-10"
    >
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: 0,
          ease: "easeInOut"
        }}
      >
        <CheckCircle className="w-8 h-8 text-yellow-400" />
      </motion.div>
    </motion.div>
  );
};

const AspectBox = ({ aspect, isPlayed, isResults, onClick, showCelebration, onCelebrationComplete }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        flex-shrink-0 w-32 h-20 mx-2 rounded-xl shadow-md cursor-pointer relative
        ${isResults
          ? 'bg-gradient-to-br from-amber-400 to-amber-600'
          : location.pathname.includes('aspect/' + aspect.id)
            ? isPlayed
              ? 'bg-gradient-to-br from-cyan-400 to-green-600'
              : 'bg-gradient-to-br from-cyan-200 to-gray-400'
            : isPlayed
              ? 'bg-gradient-to-br from-green-400 to-green-600'
              : 'bg-gradient-to-br from-gray-200 to-gray-400'
        }
        flex flex-col items-center justify-center p-4
      `}
    >
      <AnimatePresence>
        {!showCelebration && isPlayed && !isResults && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-white" />
          </motion.div>
        )}


      </AnimatePresence>

      <AnimatePresence>
          {showCelebration && <VoteCelebration onComplete={onCelebrationComplete} />}
        </AnimatePresence>
      <motion.span
        className="text-white font-medium text-center"
        animate={{ scale: isPlayed ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        {isResults ? 'Results' : splitAndJoin(aspect.metric_name)}
      </motion.span>
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

const AspectsProgressBar = ({ comparisonMetrics, onAspectClick }) => {
  const scrollContainerRef = useRef(null);
  const [sortedMetrics, setSortedMetrics] = useState([]);
  const [celebratingAspectId, setCelebratingAspectId] = useState(null);

  console.log('AspectsProgressBar: received comparisonMetrics:', comparisonMetrics);

  // Update sorted metrics whenever comparisonMetrics changes
  useEffect(() => {
    console.log('AspectsProgressBar: comparisonMetrics changed:', comparisonMetrics);
    const sorted = [...comparisonMetrics];
    console.log('AspectsProgressBar: sorted metrics:', sorted);
    setSortedMetrics(sorted);
  }, [comparisonMetrics]);

  // Handle vote celebration
  useEffect(() => {
    const newlyVotedAspect = comparisonMetrics.find(
      (metric, index) => metric.userVoted && !sortedMetrics[index]?.userVoted
    );

    if (newlyVotedAspect) {
      setCelebratingAspectId(newlyVotedAspect.id);
    }
  }, [comparisonMetrics, sortedMetrics]);

  const handleCelebrationComplete = () => {
    setCelebratingAspectId(null);
    // Find the next unvoted aspect
    const currentIndex = sortedMetrics.findIndex(metric => metric.id === celebratingAspectId);
    const nextUnvoted = sortedMetrics.slice(currentIndex + 1).find(metric => !metric.userVoted);

    if (nextUnvoted) {
      onAspectClick(nextUnvoted);
    } else {
      // If no more unvoted aspects, go to results
      onAspectClick({ id: 'results' });
    }
  };

  const scrollToAspect = (index) => {
    if (scrollContainerRef.current) {
      const aspectWidth = 144; // 32 (width) + 16 (mx-2) = 48 * 3 (to center it)
      const targetScroll = index * aspectWidth;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Find the first unvoted aspect and scroll to it
    if (scrollContainerRef.current) {
      let firstUnvotedIndex = -1;
      if (location.pathname.includes('aspect/')) {
        firstUnvotedIndex = sortedMetrics.findIndex(metric => metric.id === parseInt(location.pathname.split('/').pop()));
      } else {
        firstUnvotedIndex = sortedMetrics.findIndex(metric => !metric.userVoted);
      }

      if (firstUnvotedIndex !== -1) {
        scrollToAspect(firstUnvotedIndex);
      } else {
        scrollContainerRef.current.scrollTo({
          left: scrollContainerRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }
    }
  }, [sortedMetrics]);

  return (
    <motion.div
      className="w-full overflow-hidden py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-4 px-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {sortedMetrics.map((aspect) => (
          <motion.div
            key={aspect.id}
            className='flex flex-col items-center justify-center'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {location.pathname.includes('aspect/' + aspect.id) && (
              <motion.span
                className='text-sm text-gray-500'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Base your vote on
              </motion.span>
            )}
            <AspectBox
              key={aspect.id}
              aspect={aspect}
              isPlayed={aspect.userVoted}
              isResults={false}
              onClick={() => onAspectClick(aspect)}
              showCelebration={celebratingAspectId === aspect.id}
              onCelebrationComplete={handleCelebrationComplete}
            />
          </motion.div>
        ))}

        <motion.div
          key={'results'}
          className='flex flex-col items-center justify-center'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {location.pathname.includes('results') && (
            <motion.span
              className='text-sm text-gray-500'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              View
            </motion.span>
          )}
          <AspectBox
            aspect={{ metric_name: 'Results' }}
            isPlayed={true}
            isResults={true}
            onClick={() => onAspectClick({ id: 'results' })}
          />
        </motion.div>

        <motion.div
          key={'explore'}
          className='flex flex-col items-center justify-center'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AspectBox
            aspect={{ metric_name: 'Explore More' }}
            isPlayed={false}
            isResults={false}
            onClick={() => onAspectClick({ id: 'explore' })}
          />
        </motion.div>

      </div>
    </motion.div>
  );
};

export default AspectsProgressBar; 