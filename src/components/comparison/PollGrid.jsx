import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import ComparisonGrid from './ComparisonGrid';
import ComparisonHeader from './ComparisonHeader';

const PollGrid = ({ title, items, onVote, votedItemId, userVoted, nextPollId }) => {
  const { currentTheme } = useTheme();
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Transform scroll position into height value with a more gradual range
  const height = useTransform(
    scrollY,
    [0, window.innerHeight * 0.85], // More gradual contraction
    ['100vh', '20vh'] // Higher minimum height
  );

  return (
    <motion.div 
      className="fixed left-0 right-0 z-10"
      style={{ 
        backgroundColor: currentTheme.colors.background,
        overflow: 'hidden',
        height,
        top: '64px', // Account for header height
      }}
    >
      <ComparisonHeader nextPollId={nextPollId} />
      <div className="h-full flex flex-col">
        <div className="flex-1">
          <ComparisonGrid 
            height={height} 
            title={title}
            items={items}
            onVote={onVote}
            votedItemId={votedItemId}
            userVoted={userVoted}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PollGrid; 