import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Target, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useHeader } from '../../contexts/HeaderContext';
import { useTheme } from '../../contexts/ThemeContext';
import AspectBox from './AspectBox';
import { changeColorAlpha } from '../../lib/utils';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';

const AspectsProgressBar = ({ comparisonMetrics, onAspectClick, userVotedAll, currentSet, celebratingAspectId, currentAspect, onNextClick }) => {
  const scrollContainerRef = useRef(null);
  const isResultsPage = location.pathname.includes('results');
  const [sortedMetrics, setSortedMetrics] = useState([]);
  const [scale, setScale] = useState(1);
  const { isHeaderVisible } = useHeader();
  const { currentTheme } = useTheme();
  const [showAspectRoutes, setShowAspectRoutes] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [is2line, setIs2line] = useState(false);
  const [nextUnvotedAspect, setNextUnvotedAspect] = useState(null);

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
      const aspectWidth = 144;
      const targetScroll = index * aspectWidth;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
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
          </AnimatePresence>
        </div>

        <div
          className='flex flex-row rounded-full m-2 ml-4 mr-4 justify-center items-center'
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', cursor: 'pointer' }}
        >
          <div className='flex flex-col rounded-lg items-center justify-center py-2 px-8'>
            <h4> <span className='text-md font-bold text-center px-2 mb-2'>{currentSet?.name.substring(0,currentSet?.name.length - 1)}</span> <span className='text-sm' >based on </span></h4>

            {sortedMetrics.length > 0  && (
              <motion.div
                className="relative"
              >
                <div className='flex flex-row items-center justify-center'>
                  <motion.span 
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 1, -1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: !currentAspect?.userVoted ? Infinity : 0,
                      repeatType: "reverse"
                    }} 
                    className='text-md text-gray-500 text-center rounded-lg px-4 py-2 mt-2 flex flex-row items-center justify-center'
                    style={{ backgroundColor: currentTheme.colors.secondary, color: 'white' }}
                  >
                    <Target className='w-4 h-4' />{isResultsPage ? (<span className='font-bold'>{sortedMetrics.length} Aspects</span>) : (<span className='font-bold'>{currentAspect?.metric_name || ''}</span>)}
                  </motion.span>

                  {!isResultsPage && currentAspect && (
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 1, -1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: currentAspect?.userVoted ? Infinity : 0,
                        repeatType: "reverse"
                      }}
                      className="relative"
                    >
                        <>
                          <div className="relative">
                            {celebratingAspectId && (
                              <motion.svg
                                className="absolute -inset-1"
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                              >
                                <motion.circle
                                  cx="20"
                                  cy="20"
                                  r="18"
                                  fill="none"
                                  stroke="lightgray"
                                  strokeWidth="4"
                                  strokeDasharray="125"
                                  strokeDashoffset="125"
                                  initial={{ strokeDashoffset: 125 }}
                                  animate={{ strokeDashoffset: 0 }}
                                  transition={{ duration: SHOW_RESULTS_DURATION, ease: "linear" }}
                                />
                              </motion.svg>
                            )}
                      {!nextUnvotedAspect && (
                            <ChevronRight 
                              className="bg-yellow-300 rounded-full w-8 h-8 text-amber-800 p-1 mt-2 cursor-pointer relative z-10"
                              onClick={(e) => {
                                
                              onNextClick();
                              }}
                            />
                      )}
                      {nextUnvotedAspect && (
                        
                            <ChevronRight 
                            className="rounded-full w-8 h-8 text-white p-1 mt-2 cursor-pointer relative z-10" 
                            style={{ backgroundColor: celebratingAspectId ?  currentTheme.colors.secondary:  changeColorAlpha(currentTheme.colors.secondary, 0.5) }}
                            onClick={(e) => {
                              
                              onNextClick();
                            }}
                            />
                      )}
                          </div>
                        </>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
            <div className='absolute right-0 top-50 m-4'
                    onClick={() => setShowAspectRoutes(!showAspectRoutes)}
                    >
              {!showAspectRoutes ? (<ChevronDown size={24} className='ml-2' />) : (<ChevronUp size={24} className='ml-2' />)}
            </div>
          </div>
        </div>

        {showAspectRoutes && !userVotedAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div className="flex items-center justify-center ">
                  <h2 className="text-sm font-bold text-center">Vote all to reveal results</h2>
                </motion.div>
              </motion.div>
            )}
        {showAspectRoutes && (
          <div
            ref={scrollContainerRef}
            className="flex pt-2 "
          >
            <span className='absolute  text-sm text-gray-500 mt-2 z-10 bg-white justify-center items-center rounded-full p-2 mr-2'
            style={{ backgroundColor: currentTheme.colors.secondary, color: 'white' }}
            ><Target className='w-10 h-10' /></span>
            <div className='flex overflow-x-auto px-4 ml-16 scrollbar-hide items-center'
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingBottom: '0.5rem'
              }}>
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
                      onAspectClick(aspect);
                    }}
                    showCelebration={celebratingAspectId === aspect.id}
                    is2line={is2line}
                    currentAspect={currentAspect}
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
                  currentAspect={currentAspect}
                />
              </motion.div>
              </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AspectsProgressBar; 