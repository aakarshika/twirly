import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Target } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import AspectBox from './AspectBox';

const AspectsProgressBar = ({ items, comparisonMetrics, onAspectClick, userVotedAll, currentSet, celebratingAspectId, currentAspect }) => {
  const scrollContainerRef = useRef(null);
  const [sortedMetrics, setSortedMetrics] = useState([]);
  const { currentTheme } = useTheme();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [is2line, setIs2line] = useState(false);
  const [, setNextUnvotedAspect] = useState(null);
  const [highlightHeading, setHighlightHeading] = useState(false);

  useEffect(() => {
    if(currentAspect) {
      setHighlightHeading(false);
      setTimeout(() => {
        setHighlightHeading(false);
      }, 3000);
    }
  }, [currentSet]);

  useEffect(() => {
    const sorted = [...comparisonMetrics];
    setSortedMetrics(sorted);
    setIs2line(sorted.some(metric => metric?.metric_name?.length > 25));
    setNextUnvotedAspect(sorted.find(metric => !metric?.userVoted));
  }, [comparisonMetrics]);

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
  }, [comparisonMetrics, sortedMetrics, isInitialLoad]);

  const showAspectRoutes = sortedMetrics.length > 0;
  const scale = 1;

  const scrollToAspect = index => {
    if (!scrollContainerRef.current) return;

    const aspectWidth = 240; // 200px width + 40px margins
    const containerWidth = scrollContainerRef.current.clientWidth;
    const targetPosition = index * aspectWidth;

    // Calculate the center position
    const centerPosition = targetPosition - (containerWidth / 2) + (aspectWidth / 2);

    scrollContainerRef.current.scrollTo({
      left: Math.max(0, centerPosition),
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!scrollContainerRef.current || sortedMetrics.length === 0) return;

    const currentIndex = currentAspect
      ? sortedMetrics.findIndex(metric => metric.id === currentAspect.id)
      : sortedMetrics.length;

    if (currentIndex !== -1) {
      setTimeout(() => scrollToAspect(currentIndex), 100);
    }
  }, [currentAspect, sortedMetrics]);

  return (
    <motion.div
      className="w-full overflow-hidden z-10"
      style={{
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
                <motion.div className="flex items-center justify-center space-x-3">
                  <PartyPopper className="w-6 h-6 text-amber-500" />
                  <h2 className="text-lg font-bold text-center">The Results Are In!</h2>
                  <PartyPopper className="w-6 h-6 text-amber-500" />
                </motion.div>
              </motion.div>
            )}
            {/* {!userVotedAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div className="flex items-center justify-center space-x-3 p-2">
                  <PartyPopper className="w-6 h-6 text-transparent" />
                  <PartyPopper className="w-6 h-6 text-transparent" />
                </motion.div>
              </motion.div>
            )} */}
          </AnimatePresence>
        </div>

        <motion.div
          animate={{ height: highlightHeading ? '300px' : 'auto' }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex flex-row justify-center items-center"
          style={{ cursor: 'pointer' }}
        >
          <div className="flex flex-col rounded-lg justify-start py-2 px-2">
            <div className={`flex ${highlightHeading ? 'flex-col p-5' : 'flex-row'} items-center justify-center overflow-wrap`}>
              <motion.span
                className="text-4xl p-2"
                animate={{ scale: highlightHeading ? [1, 1.2, 1] : [1, 1, 1] }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >?</motion.span>
              <motion.span
                className="text-md md:text-lg lg:text-2xl text-center text-gray-500 font-bold pr-4"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >{(currentSet?.name || '').replace('?', '')}</motion.span>
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
            <div className="flex ml-10 items-center justify-center "style={{ color: currentTheme.colors.secondary }}>
              <span className="text-md font-semibold mr-10" >
                <span className="text-lg"> based
                  <Target className="w-3 h-3 ml-1 inline-block rounded-full"  />n
                </span>
              </span>
                  <h2 className="text-md mr-10" >
                {sortedMetrics.filter(metric => metric?.userVoted).length}/{sortedMetrics.length}
              </h2>
            </div>
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
                scrollBehavior: 'smooth',
              }}
            >
              <div className="flex items-center" style={{ minWidth: 'max-content' }}>
                {/* Left padding */}
                <div style={{ width: 'calc(50% - 120px)' }} />

                {/* Aspects container */}
                <div className="flex items-center space-x-6">
                  {sortedMetrics.map((aspect, index) => (
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
                          scrollToAspect(index);
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
                    className="flex flex-col items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AspectBox
                      aspect={{ metric_name: 'Results' }}
                      isPlayed={true}
                      isResults={true}
                      onClick={() => {
                        scrollToAspect(sortedMetrics.length);
                        onAspectClick({ id: 'results' });
                      }}
                      is2line={is2line}
                      currentAspect={currentAspect}
                    />
                  </motion.div>
                </div>

                {/* Right padding */}
                <div style={{ width: 'calc(50% - 120px)' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AspectsProgressBar;
