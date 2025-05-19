import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2, Sparkles, BarChart, CheckCircle, PartyPopper, ChevronDown, ChevronUp } from 'lucide-react';
import { splitAndJoin, changeColorAlpha } from '../../lib/utils';
import { useHeader } from '../../contexts/HeaderContext';
import { useTheme } from '../../contexts/ThemeContext';

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

const AspectBox = ({ aspect, isPlayed, isResults, onClick, showCelebration, onCelebrationComplete, is2line }) => {
  const isCurrentAspect = location.pathname.includes('aspect/' + aspect.id);
  const { currentTheme } = useTheme();
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef(null);
  
  useEffect(() => {
    if (textRef.current) {
      const { scrollHeight, clientHeight } = textRef.current;
      setIsClamped(scrollHeight > clientHeight);
    }
  }, [aspect.metric_name]);
  
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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex mx-2 rounded-lg cursor-pointer relative flex flex-col items-center justify-center p-4 "
      style={{
        backgroundColor: getBackgroundColor(),
        color: 'white'
      }}
    >
      <AnimatePresence>
        {showCelebration && <VoteCelebration onComplete={onCelebrationComplete} />}
      </AnimatePresence>
      
      <motion.div
        ref={textRef}
        className={`flex items-center justify-center max-w-[200px] ${aspect.metric_name.length > 25 ? `line-clamp-2 min-w-[200px] overflow-hidden`:`whitespace-nowrap`} ${is2line ? 'h-[50px] ' : ''}`}
        animate={{ scale: isPlayed ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className='text-white font-medium text-center'>{isResults ? 'Results' : splitAndJoin(aspect.metric_name.length > 50 ? aspect.metric_name.substring(0, 50) + '...' : aspect.metric_name)}</span>
      </motion.div>
      
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
    </motion.div>
  );
};

const AspectsProgressBar = ({ comparisonMetrics, onAspectClick, userVotedAll, currentSet }) => {
  const scrollContainerRef = useRef(null);
  const isResultsPage = location.pathname.includes('results');
  const [sortedMetrics, setSortedMetrics] = useState([]);
  const [celebratingAspectId, setCelebratingAspectId] = useState(null);
  const [scale, setScale] = useState(1);
  const { isHeaderVisible } = useHeader();
  const { currentTheme } = useTheme();
  const [showAspectRoutes, setShowAspectRoutes] = useState(!isResultsPage);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentAspect, setCurrentAspect] = useState(null);
  const [is2line, setIs2line] = useState(false);
  // Update sorted metrics whenever comparisonMetrics changes
  useEffect(() => {
    const sorted = [...comparisonMetrics];
    setSortedMetrics(sorted);
    const id = location.pathname.split('/').pop();
    const current = sorted.find(metric => metric.id === parseInt(id));
    setCurrentAspect(current);
    setIs2line(sorted.some(metric => metric.metric_name.length > 25));
  }, [comparisonMetrics]);

  // Handle vote celebration
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    const newlyVotedAspect = comparisonMetrics.find(
      (metric, index) => metric.userVoted && !sortedMetrics[index]?.userVoted
    );

    if (newlyVotedAspect) {
      setCelebratingAspectId(newlyVotedAspect.id);
    }
  }, [comparisonMetrics, sortedMetrics, isInitialLoad]);

  const handleCelebrationComplete = () => {
    setCelebratingAspectId(null);

    // Find any unvoted aspect, regardless of order
    const nextUnvoted = sortedMetrics.find(metric => !metric.userVoted);

    if (nextUnvoted) {
      // Find the index of the next unvoted aspect
      const nextIndex = sortedMetrics.findIndex(metric => metric.id === nextUnvoted.id);
      // Scroll to the aspect
      scrollToAspect(nextIndex);
      // Navigate to the aspect
      onAspectClick(nextUnvoted);
    } else {
      // Only go to results if all aspects are voted
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
      className="w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.primary,
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        marginTop: '-0.5rem'
      }}
    >
      <div>
        <div className="flex flex-col mb-2">
          <AnimatePresence>
            {userVotedAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div className="flex items-center justify-center space-x-3 p-2">
                  <PartyPopper className="w-6 h-6 text-amber-500" />
                  <h2 className="text-lg font-bold text-center">The Results Are In!</h2>
                  <PartyPopper className="w-6 h-6 text-amber-500" />
                </motion.div>
              </motion.div>
            )}
            {!userVotedAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div className="flex items-center justify-center space-x-3 p-2">
                  <h2 className="text-sm font-bold text-center">Vote all to reveal results</h2>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className='flex flex-row rounded-full m-2 ml-4 mr-4 justify-center items-center'
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', cursor: 'pointer' }}
          onClick={() => setShowAspectRoutes(!showAspectRoutes)}
        >
          <div className=' flex flex-col rounded-lg items-center justify-center py-2 px-8 '
            
          >
            <h4> <span className='text-md font-bold text-center px-2 mb-2'>{currentSet?.name.substring(0,currentSet?.name.length - 1)}</span> <span className='text-sm' >based on </span></h4>

            {sortedMetrics.length > 0  && (
              <span className='text-lg text-gray-500 text-center rounded-lg px-4 py-2 mt-2 flex flex-row items-center justify-center'
              style={{ backgroundColor: currentTheme.colors.secondary, color: 'white' }}
              onClick={() => setShowAspectRoutes(!showAspectRoutes)}
            >
              {/* Based on  */}
              {isResultsPage ? (<span className='font-bold'>{sortedMetrics.length} Aspects</span>) : (<span className='font-bold'>{splitAndJoin(currentAspect?.metric_name || '')}</span>)}
              {!showAspectRoutes ? (<ChevronDown size={16} className='ml-2' />) : (<ChevronUp size={16} className='ml-2' />)}
            </span>)}
          </div>
        </div>

        {showAspectRoutes && (<div
          ref={scrollContainerRef}
          className="flex overflow-x-auto px-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '0.5rem'
          }}
        >
          {sortedMetrics.map((aspect) => (
            <motion.div
              key={aspect.id}
              className='pt-2'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AspectBox
                key={aspect.id}
                aspect={aspect}
                isPlayed={aspect.userVoted}
                scale={scale}
                isResults={false}
                onClick={() => {
                  setCurrentAspect(aspect);
                  onAspectClick(aspect)}}
                showCelebration={celebratingAspectId === aspect.id}
                onCelebrationComplete={handleCelebrationComplete}
                is2line={is2line}
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
            <AspectBox
              aspect={{ metric_name: 'Results' }}
              isPlayed={true}
              isResults={true}
              onClick={() => onAspectClick({ id: 'results' })}
              is2line={is2line}
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
              is2line={is2line}
            />
          </motion.div>
        </div>)}
      </div>
    </motion.div>
  );
};

export default AspectsProgressBar; 