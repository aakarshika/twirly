import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useHeader } from '../../contexts/HeaderContext';
import ComparisonGrid from './ComparisonGrid';

const PollGrid = ({ title, items, onVote, votedItemId, userVoted, currentId, itemReviews }) => {
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  const [height, setHeight] = useState('100vh');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Direct transform from scroll position to height
  const heightTransform = useTransform(
    scrollY,
    [0, window.innerHeight * 0.7],
    ['100vh', '30vh'],
    { clamp: false }
  );

  useEffect(() => {
    // Subscribe to scroll changes with no smoothing
    return scrollY.onChange((latest) => {
      const newHeight = heightTransform.get();
      setHeight(newHeight);
    });
  }, [scrollY, heightTransform]);

  return (
    <motion.div 
      className="fixed left-0 right-0 z-10"
      style={{ 
        backgroundColor: currentTheme.colors.background,
        overflow: 'hidden',
        height,
        top: isHeaderVisible ? '64px' : '0px',
      }}
    >
      {/* ComparisonHeader  */}
      <div className="h-full flex flex-col max-w-4xl mx-auto">
        <div className="flex-1">
          <ComparisonGrid 
            isHeaderVisible={isHeaderVisible}
            currentId={currentId}
            height={height} 
            title={title}
            items={items}
            onVote={onVote}
            votedItemId={votedItemId}
            userVoted={userVoted}
            itemReviews={itemReviews}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PollGrid; 