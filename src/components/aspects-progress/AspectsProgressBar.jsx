import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Target, ChevronRight, ChevronDown, ChevronUp, FileQuestion } from 'lucide-react';
import { useHeader } from '../../contexts/HeaderContext';
import { useTheme } from '../../contexts/ThemeContext';
import AspectBox from './AspectBox';
import { changeColorAlpha } from '../../lib/utils';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';
import ProgressBar from './ProgressBar';

const AspectsProgressBar = ({ items, comparisonMetrics, onAspectClick, userVotedAll, currentSet, celebratingAspectId, currentAspect }) => {
  const scrollContainerRef = useRef(null);
  const isResultsPage = location.pathname.includes('results');
  const [sortedMetrics, setSortedMetrics] = useState([]);
  const [scale, setScale] = useState(1);
  const { isHeaderVisible } = useHeader();
  const { currentTheme } = useTheme();
  const [showAspectRoutes, setShowAspectRoutes] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [is2line, setIs2line] = useState(false);
  const [nextUnvotedAspect, setNextUnvotedAspect] = useState(null);
  const [highlightHeading, setHighlightHeading] = useState(false);
  useEffect(() => {
    if(currentAspect) {
      setHighlightHeading(true)
      setTimeout(() => {
        setHighlightHeading(false);
      }, 3000);
    }
  }, [currentSet]);

  useEffect(() => {
    const sorted = [...comparisonMetrics];
    setSortedMetrics(sorted);
    setIs2line(sorted.some(metric => metric.metric_name.length > 25));
    setNextUnvotedAspect(sorted.find(metric => !metric.userVoted));
  }, [comparisonMetrics]);

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
  }, [comparisonMetrics, sortedMetrics, isInitialLoad]);

  const scrollToAspect = (index) => {
    if (scrollContainerRef.current) {
      const aspectWidth = 250;
      const targetScroll = index * aspectWidth;
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollPosition = Math.max(0, targetScroll - (containerWidth / 2) + (aspectWidth / 2));

      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };


  // Modified useEffect for current aspect changes
  useEffect(() => {
    if (!scrollContainerRef.current || sortedMetrics.length === 0) return;
    if (!currentAspect) {
      scrollToAspect(sortedMetrics.length);
      return;
    }

    const currentIndex = sortedMetrics.findIndex(metric => metric.id === currentAspect.id);
    console.log('Scrolling to index:', currentIndex);
    if (currentIndex === -1) {
      currentIndex = sortedMetrics.length;
    }
    
    if (currentIndex !== -1) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToAspect(currentIndex);
      }, 100);
    }
  }, [currentAspect, sortedMetrics]);

  return (
    <motion.div
      className="w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.primary,
        paddingBottom: '0.5rem',
      }}
    >
      <div>
        <div className="flex flex-col">
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
          </AnimatePresence>
        </div>

        <motion.div
          animate={{  height:highlightHeading ? '300px' : 'auto' }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className='flex flex-row  justify-center items-center'
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', cursor: 'pointer' }}
        >
          <div className='flex flex-col rounded-lg justify-start py-2 px-2'>
            <div className={`flex ${highlightHeading ? 'flex-col p-5' : 'flex-row'} items-center justify-center overflow-wrap`}>
            <motion.span className='text-4xl p-2'
            animate={{ scale: highlightHeading ? [1, 1.2, 1] : [1, 1, 1] }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            

             >?</motion.span>
            <motion.span className='text-md text-center text-gray-500 font-bold pr-4'
            animate={{ fontSize: highlightHeading ? '1.5rem' : '1rem' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            >{currentSet?.name.substring(0,currentSet?.name.length - 1)}</motion.span> 
            {/* <span className='text-sm' >based on </span> */}
            </div>
          </div>
        </motion.div>

        {showAspectRoutes && !userVotedAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div className="flex ml-10 items-center justify-between ">
                  <soan></soan>
                  <span className="text-md font-semibold" style={{ color: 'rgb(174, 174, 174)' }}>
                    {/* Cast your vote  */}
                    <span className='text-lg text-gray-500'> based 
                      <Target className='w-3 h-3 ml-1 inline-block rounded-full text-gray'  />n
                    </span>
                    </span>
                  <h2 className="text-md mr-10" style={{ color: 'rgb(174, 174, 174)' }}>{sortedMetrics.filter(metric => metric.userVoted).length}/{sortedMetrics.length}</h2>
                </motion.div>
              </motion.div>
            )}
        {showAspectRoutes && (
          <div className="relative w-full overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth'
              }}
            >
              <div className='absolute text-sm rounded-full text-gray-500 z-10 justify-center items-center ml-1 mr-1'>
                {/* <Target className='w-6 h-6 rounded-full p-1 m-1' style={{ backgroundColor: currentTheme.colors.secondary, color: 'white' }} /> */}
              </div>
              <div className='flex px-4 ml-5 items-center space-x-6'>
                {sortedMetrics.map((aspect) => (
                  <motion.div
                    key={aspect.id}
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
                        onAspectClick(aspect);
                      }}
                      showCelebration={celebratingAspectId === aspect.id}
                      is2line={is2line}
                      currentAspect={currentAspect}
                      items={items}
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
                    currentAspect={currentAspect}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AspectsProgressBar; 