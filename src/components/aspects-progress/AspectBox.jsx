import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Heart, Trophy } from 'lucide-react';
import { splitAndJoin, changeColorAlpha } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import VoteCelebration from './VoteCelebration';
import ProgressBar from './ProgressBar';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';

const AspectBox = ({ aspect, isPlayed, isResults, onClick, showCelebration, is2line, currentAspect, items }) => {
  const isCurrentAspect = currentAspect?.id === aspect.id;
  const { currentTheme } = useTheme();
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef(null);
  const [showProgress, setShowProgress] = useState(false);

  const [itemVoted, setItemVoted] = useState('');

  useEffect(() => {
    setItemVoted(items?.find(item => item.id === aspect.itemVoted)?.name || '');
  }, [items, aspect]);

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
        : changeColorAlpha(currentTheme.colors.secondary, 0.8);
    }
    
    return isPlayed 
      ? changeColorAlpha(currentTheme.colors.secondary, 0.4)
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
        y: 0
        
      }}
      transition={{ duration: 0.3 }}
      className={`flex mx-1 rounded-sm cursor-pointer relative flex flex-col items-center justify-center px-2 p-1 ${is2line ? 'h-[75px] ' : 'h-[50px]'}`}
      style={{
        border: isCurrentAspect ? `2px solid ${currentTheme.colors.secondary}` : 'none',
        backgroundColor: getBackgroundColor(),
        color: 'white'
      }}
    >
      {/* {showCelebration && showProgress && <ProgressBar duration={SHOW_RESULTS_DURATION} />} */}
{/*       
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
      )} */}

<motion.div className='flex flex-col items-center justify-center mx-10' style={{ scale: isCurrentAspect ? 1.1 : 1 }}>
      <motion.div
        ref={textRef}
        className={`flex items-center justify-center max-w-[200px]  ${aspect.metric_name.length > 25 ? `min-w-[200px] overflow-hidden`:`whitespace-nowrap`} `}
        animate={{ scale: isPlayed ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
      {!isResults && (<span className='text-white font-medium text-center px-2'
      style={{ scale: isCurrentAspect ? 1.1 : 1, color: isCurrentAspect && 'white' }}
      >
        {splitAndJoin(aspect.metric_name.length > 50 
          ? aspect.metric_name.substring(0, 50) + '...' 
            : aspect.metric_name)}
            </span>)}
        {isResults && (<span className='text-white font-medium text-center'>
          <Trophy className='w-6 h-6' />
              </span>)}
              
      </motion.div>
      {aspect.userVoted && (
        <div className="flex flex-row text-white-500 items-center gap-1.5 w-full">
          <Heart className="w-3 h-3 flex-shrink-0" fill='white'/>  
          <span className='line-clamp-1 text-xs flex-1 min-w-0 text-white-1/2'>{itemVoted}</span>
        </div>
      )}
      </motion.div>
    </motion.div>
  );
};

export default AspectBox; 