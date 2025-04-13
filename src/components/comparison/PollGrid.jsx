import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import ComparisonGrid from './ComparisonGrid';

const PollGrid = ({ title, items, onVote, votedItemId, userVoted, nextPollId }) => {
  const { currentTheme } = useTheme();
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  const [height, setHeight] = useState('100vh'); // State to hold the height

  useEffect(() => {
    setMounted(true);
  }, []);

  // Define the transform outside of the subscription
  const heightTransform = useTransform(
    scrollY,
    [0, window.innerHeight * 0.85],
    ['100vh', '20vh']
  );

  useEffect(() => {
    // Update height based on scroll position
    const unsubscribe = scrollY.onChange((latest) => {
      const newHeight = heightTransform.get(); // Get the transformed height
      setHeight(newHeight); // Update the height state
    });

    return () => unsubscribe(); // Clean up the subscription
  }, [scrollY, heightTransform]);

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
      {/* <ComparisonHeader nextPollId={nextPollId} /> */}
      <div className="h-full flex flex-col">
        <div className="flex-1">
          <ComparisonGrid 
            nextPollId={nextPollId}
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