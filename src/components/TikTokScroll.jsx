import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useComparisonSets } from '../hooks/useComparisonSets';
import ComparisonCard from '../pages/compare-page/ComparisonCard';
import { Home, TrendingUp } from 'lucide-react';
import { splitAndJoin } from '../lib/utils';


const TikTokScroll = () => {
  const { id: currentId } = useParams();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontalDrag, setIsHorizontalDrag] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(true);
  const containerRef = useRef(null);
  const lastScrollTime = useRef(Date.now());
  const controls = useAnimation();
  const [dragY, setDragY] = useState(0);
  const [currentSelectedTag, setCurrentSelectedTag] = useState('user_home_feed_91819');
  const [dragX, setDragX] = useState(0);
  const [isCommentsCollapsed, setIsCommentsCollapsed] = useState(true);

  const {
    comparisonSets,
    currentIndex,
    setCurrentIndex,
    handleVote,
    handleReset,
    userPreferences,
    allCategories,
    setCategoryId,
    setCategoryIds,
    setSelectedTag,
    handleLikeComparisonSet,
  } = useComparisonSets(parseInt(currentId) || 0);

  const selectedTagRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (selectedTagRef.current) {
      selectedTagRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentSelectedTag]);

  useEffect(() => {
    setIsCommentsCollapsed(true);
    if (currentIndex === 0 || currentIndex === -1) {
      setDragX(0);
      setIsHorizontalDrag(false);
      setIsDragging(false);
    }
    if (currentIndex >= 0 && comparisonSets[currentIndex]) {
      navigate(`/compare/${comparisonSets[currentIndex].id}`, { replace: true });
    }
  }, [currentIndex, comparisonSets]);

  useEffect(() => {
    if (comparisonSets[currentIndex]?.hasVoted && !hasUserInteracted) {
      const timer = setTimeout(goToNextSet, 3000);
      return () => clearTimeout(timer);
    }
  }, [comparisonSets[currentIndex]?.hasVoted, hasUserInteracted]);

  useEffect(() => {
    if (currentSelectedTag) loadNewBatchByCategory(currentSelectedTag);
  }, [currentSelectedTag]);

  const goToNextSet = () => {
    if (currentIndex < comparisonSets.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goToPreviousSet = () => {
    if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); setHasUserInteracted(true); }
  };

  const loadNewBatchByCategory = (tag) => {
    const cat = allCategories.find(c => c.name.toLowerCase().trim() === tag.toLowerCase().trim());
    setCategoryId(cat?.userCat ? cat?.id : null);
    setCategoryIds(cat && !cat.userCat ? cat?.included_categories : null);
    setSelectedTag(tag);
  };

  const handleDragStart = (event, info) => {
    setIsDragging(true);
    setIsHorizontalDrag(Math.abs(info.offset.x) > Math.abs(info.offset.y));
  };

  const handleDrag = (event, info) => {
    if (isHorizontalDrag) { setDragX(info.offset.x); setDragY(0); }
    else { setDragY(info.offset.y); setDragX(0); }
  };

  const handleDragEnd = (event, info) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 300) return;
    lastScrollTime.current = now;
    if (!isCommentsCollapsed) return;

    if (isHorizontalDrag) {
      const hThreshold = 50;
      if (Math.abs(info.offset.x) > hThreshold || Math.abs(info.velocity.x) > 500) {
        const list = ['user_home_feed_91819', 'trending', ...allCategories.map(c => c.name)];
        if (info.offset.x > 0 && currentSelectedTag !== 'user_home_feed_91819') prevTag(list);
        else if (info.offset.x < 0 && currentSelectedTag !== list[list.length - 1]) nextTag(list);
      }
      setDragX(0); setIsHorizontalDrag(false); setIsDragging(false);
    } else {
      const threshold = window.innerHeight * 0.3;
      if (Math.abs(info.offset.y) > threshold || Math.abs(info.velocity.y) > 500) {
        if (info.offset.y > 0) goToPreviousSet();
        else goToNextSet();
      }
      setIsDragging(false); setDragY(0);
    }
  };

  const prevTag = (list) => {
    const idx = list.indexOf(currentSelectedTag);
    if (idx > 0) setCurrentSelectedTag(list[idx - 1]);
  };

  const nextTag = (list) => {
    const idx = list.indexOf(currentSelectedTag);
    if (idx < list.length - 1) setCurrentSelectedTag(list[idx + 1]);
  };

  const renderSet = (setData, index) => (
    <motion.div
      key={`set-${setData.id}-${index}`}
      className="w-full flex rounded-lg bg-bg shadow-lg"
      style={{ position: 'absolute', height: '100%', width: '100%' }}
      initial={false}
      animate={{
        y: (index - currentIndex) * (window.innerHeight - 90) + dragY,
        opacity: isDragging && isHorizontalDrag ? 0 : 1,
        scale: isDragging && !isHorizontalDrag && currentIndex === index ? 0.95 : 1,
      }}
      transition={{ type: 'linear', duration: 0.3 }}
    >
      <ComparisonCard
        setData={setData}
        isActive={index === currentIndex}
        isCommentsCollapsed={isCommentsCollapsed}
        setIsCommentsCollapsed={setIsCommentsCollapsed}
        isDragging={isDragging}
        currentIndex={currentIndex}
        index={index}
        handleVote={handleVote}
        handleReset={handleReset}
        handleLikeComparisonSet={handleLikeComparisonSet}
        users={[]}
        userPreferences={userPreferences}
        setHasUserInteracted={setHasUserInteracted}
      />
    </motion.div>
  );

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col justify-between">
      {/* Category tag bar */}
      <div
        className="h-auto rounded-t-sm bg-surface"
        style={{ paddingTop: 'calc(env(safe-area-inset-top))' }}
      >
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex flex-row min-w-max px-2">
            <div
              ref={currentSelectedTag === 'user_home_feed_91819' ? selectedTagRef : null}
              className={`flex flex-row p-2 items-center gap-1 cursor-pointer ${currentSelectedTag === 'user_home_feed_91819' ? 'font-semibold text-primary' : 'text-text-muted'}`}
              onClick={() => setCurrentSelectedTag('user_home_feed_91819')}
            >
              <Home className="inline-block" size={14} /><span>Feed</span>
            </div>
            <div
              ref={currentSelectedTag === 'trending' ? selectedTagRef : null}
              className={`flex flex-row p-2 gap-1 items-center cursor-pointer ${currentSelectedTag === 'trending' ? 'font-semibold text-primary' : 'text-text-muted'}`}
              onClick={() => setCurrentSelectedTag('trending')}
            >
              <TrendingUp className="inline-block" size={16} /><span>Trending</span>
            </div>
            {allCategories.filter(c => c.userCat).slice(0, 3).map(category => (
              <div
                key={category.name}
                ref={currentSelectedTag === category.name ? selectedTagRef : null}
                className={`flex flex-row p-2 gap-1 cursor-pointer ${currentSelectedTag === category.name ? 'font-semibold text-primary' : 'text-text-muted'}`}
                onClick={() => setCurrentSelectedTag(category.name)}
              >
                <span className="whitespace-nowrap">{category.name}</span>
              </div>
            ))}
            {allCategories.filter(c => !c.userCat).map(category => (
              <div
                key={category.name}
                ref={currentSelectedTag === category.name ? selectedTagRef : null}
                className={`flex flex-row p-2 gap-1 cursor-pointer ${currentSelectedTag === category.name ? 'text-primary' : 'text-text-muted'}`}
                onClick={() => setCurrentSelectedTag(category.name)}
              >
                <span className="whitespace-nowrap">{splitAndJoin(category.name)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll container */}
      <div
        className="h-full w-full overflow-hidden"
        style={{ paddingBottom: 'calc(42px + env(safe-area-inset-bottom))' }}
      >
        <motion.div
          ref={containerRef}
          className="h-full w-full flex items-center justify-center rounded-lg"
          drag={isCommentsCollapsed}
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          dragDirectionLock
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden' }}
        >
          <AnimatePresence>
            {comparisonSets.length > 0
              ? comparisonSets.map((item, index) => renderSet(item, index))
              : (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <p className="text-text-muted text-center">
                    No comparisons for this category yet.<br />Add some?
                  </p>
                </div>
              )
            }
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default TikTokScroll;
