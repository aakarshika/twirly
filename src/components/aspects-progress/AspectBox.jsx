import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { splitAndJoin, changeColorAlpha } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import VoteCelebration from './VoteCelebration';
import ProgressBar from './ProgressBar';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';

const AspectBox = ({ aspect, isPlayed, isResults, onClick, showCelebration, is2line, currentAspect }) => {
  const isCurrentAspect = currentAspect?.id === aspect.id;
  const { currentTheme } = useTheme();
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef(null);
  const [showProgress, setShowProgress] = useState(false);
  
  useEffect(() => {
    if (textRef.current) {
      const { scrollHeight, clientHeight } = textRef.current;
      setIsClamped(scrollHeight > clientHeight);
    }
  }, [aspect.metric_name]);
  
  useEffect(() => {
    let timer;
    if (showCelebration) {
      setShowProgress(true);
      timer = setTimeout(() => {
        setShowProgress(false);
      }, SHOW_RESULTS_DURATION * 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showCelebration]);
  
  const getBackgroundColor = () => {
    if (isResults) {
      return 'rgb(251 191 36)'; // amber-400
    }
    
    if (isCurrentAspect) {
      return isPlayed 
        ? currentTheme.colors.secondary
        : changeColorAlpha(currentTheme.colors.secondary, 0.6);
    }
    
    return isPlayed 
      ? changeColorAlpha(currentTheme.colors.secondary, 0.8)
      : currentTheme.colors.disabled;
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: isCurrentAspect ? 1.1 : 1 
      }}
      transition={{ duration: 0.3 }}
      className="flex mx-2 rounded-lg cursor-pointer relative flex flex-col items-center justify-center p-4"
      style={{
        backgroundColor: getBackgroundColor(),
        color: 'white'
      }}
    >
      {showCelebration && showProgress && <ProgressBar duration={SHOW_RESULTS_DURATION} />}
      
      {!showCelebration && isCurrentAspect && !isResults && (
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

      <motion.div
        ref={textRef}
        className={`flex items-center justify-center max-w-[200px] ${aspect.metric_name.length > 25 ? `line-clamp-2 min-w-[200px] overflow-hidden`:`whitespace-nowrap`} ${is2line ? 'h-[50px] ' : ''}`}
        animate={{ scale: isPlayed ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className='text-white font-medium text-center'>{isResults ? 'Results' : splitAndJoin(aspect.metric_name.length > 50 ? aspect.metric_name.substring(0, 50) + '...' : aspect.metric_name)}</span>
      </motion.div>
    </motion.div>
  );
};

export default AspectBox; 