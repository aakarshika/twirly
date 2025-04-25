import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useHeader } from '../../contexts/HeaderContext';
import ComparisonGrid from './ComparisonGrid';
import { useNavigate } from 'react-router-dom';
const PollGrid = ({ id, title, set, items, onVote, votedItemId, userVoted, currentId, itemReviews, setId }) => {
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  const [height, setHeight] = useState('100vh');
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Direct transform from scroll position to height
  // const heightTransform = useTransform(
  //   scrollY,
  //   [0, window.innerHeight * 0.7],
  //   ['100vh', '30vh'],
  //   { clamp: false }
  // );

  // useEffect(() => {
  //   // Subscribe to scroll changes with no smoothing
  //   return scrollY.on('change',  (latest) => {
  //     const newHeight = heightTransform.get();
  //     setHeight(newHeight);
  //   });
  // }, [scrollY, heightTransform]);

  return (
    <div 
      className=""
      style={{ 
        backgroundColor: currentTheme.colors.background      }}
    >
      {/* ComparisonHeader  */}
      <div className="h-full flex flex-col max-w-4xl mx-auto">
        <div className="flex-1">

        <div className="text-center m-4">
            <div className="flex justify-between">
            <button
              onClick={() => navigate('/comparison/'+(parseInt(currentId)-1).toString())}
              className="px-4 py-2 bg-gray-400 text-white rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => navigate('/comparison/'+(parseInt(currentId)+1).toString())}
              className="px-4 py-2 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Next
            </button>
            </div>
          </div>
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
    </div>
  );
};

export default PollGrid; 