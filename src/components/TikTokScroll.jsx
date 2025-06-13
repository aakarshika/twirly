import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useComparisonSets } from '../hooks/useComparisonSets';
import Heading from '../pages/compare-page/Heading';
import Grid from '../pages/compare-page/Grid';
import AllComments from '../pages/compare-page/AllComments';
import CompareButtons from '../pages/compare-page/CompareButtons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Home, LucidePlus, Menu, PlusCircle, PlusSquareIcon, Search, Settings, SquarePlus, SquarePlusIcon, TrendingUp, User, User2, UserCircle } from 'lucide-react';


const TikTokScroll = () => {
  const { id: currentId } = useParams();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [commentsCollapsedMap, setCommentsCollapsedMap] = useState({});
  const [isHorizontalDrag, setIsHorizontalDrag] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(true);
  const containerRef = useRef(null);
  const lastScrollTime = useRef(Date.now());
  const [users, setUsers] = useState([]);
  const [metricsSectionExpanded, setMetricsSectionExpanded] = useState(false);
  const controls = useAnimation();
  const [dragY, setDragY] = useState(0);
  const [currentSelectedTag, setCurrentSelectedTag] = useState('home');

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
    handleLikeComparisonSet
  } = useComparisonSets(parseInt(currentId) || 0);

  const selectedTagRef = useRef(null);

  // Helper to get/set per-set collapsed state
  const isCommentsCollapsed = (setId) => commentsCollapsedMap[setId] ?? true;
  const setCommentsCollapsed = (setId, value) => {
    setCommentsCollapsedMap(prev => ({ ...prev, [setId]: value }));
  };

  // Ensure page scrolls to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {

      const { data, error } = await supabase
        .from('user_preferences')
        .select('user_id, display_name, username')
        .limit(10);

      if (!error && data) {
        setUsers(data.map(user => ({
          id: user.user_id,
          display: user.display_name,
          email: user.username
        })));
      }
    };
    fetchUsers();
  }, []);

  // Add effect to handle user interactions
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
    };

    // Add event listeners for common user interactions
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('mousemove', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('mousemove', handleUserInteraction);
    };
  }, []);


  // Modify the automatic navigation effect
  useEffect(() => {
    console.log('🔍 going to next set', comparisonSets[currentIndex]?.hasVoted, hasUserInteracted);
    if (comparisonSets[currentIndex]?.hasVoted && !hasUserInteracted) {
      const timer = setTimeout(() => {
        console.log('🔍 gone to next set');
        goToNextSet();
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    }
  }, [comparisonSets[currentIndex]?.hasVoted, hasUserInteracted]);



  useEffect(() => {
    if (selectedTagRef.current) {
      selectedTagRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentSelectedTag]);

  // Effect to handle URL updates when currentIndex changes
  useEffect(() => {
    if (currentIndex >= 0 && comparisonSets[currentIndex]) {
      navigate(`/compare/${comparisonSets[currentIndex].id}`, { replace: true });
    }
  }, [currentIndex, comparisonSets]);

  // Effect to handle tag changes
  useEffect(() => {
    if (currentSelectedTag) {
      const categoryId = allCategories.find(category => category.name === currentSelectedTag)?.id;
      const categoryIds = allCategories.filter(category => category.name === currentSelectedTag).map(category => category.id);
      setCategoryId(categoryId);
      setCategoryIds(categoryIds);
      setSelectedTag(currentSelectedTag);
    }
  }, [currentSelectedTag, allCategories]);

  const goToNextSet = () => {
    if (currentIndex < comparisonSets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToFirstSet = () => {
    setCurrentIndex(0);
  };

  const goToPreviousSet = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setHasUserInteracted(true);
    }
  };

  const loadNewBatchByCategory = async (tag) => {    
      const categoryId = allCategories.find(category => category.name === tag)?.id;
      const categoryIds = allCategories.filter(category => category.name === tag).map(category => category.id);
      setCategoryId(categoryId);
      setCategoryIds(categoryIds);
      setSelectedTag(tag);
  };

  // Update the category change handler
  useEffect(() => {
    if (currentSelectedTag) {
      loadNewBatchByCategory(currentSelectedTag);
    }
  }, [currentSelectedTag]);

  const handleDragStart = () => {
    setIsDragging(true);
    setIsHorizontalDrag(false);
  };

  const handleDrag = (event, info) => {
    setDragY(info.offset.y);
    // Only check for horizontal drag if comments are collapsed
    if (isCommentsCollapsed(comparisonSets[currentIndex].id)) {
      if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
        setIsHorizontalDrag(true);
      }
    }
  };

  const handleDragEnd = (event, info) => {
    const now = Date.now();
    // Prevent rapid scrolling
    if (now - lastScrollTime.current < 300) {
      return;
    }
    lastScrollTime.current = now;

    // If comments are expanded, only allow horizontal swipe to go back
    if (!isCommentsCollapsed(comparisonSets[currentIndex]?.id)) {
      if (isHorizontalDrag) {
        const horizontalThreshold = 50;
        const horizontalVelocity = info.velocity.x;

        if (Math.abs(info.offset.x) > horizontalThreshold || Math.abs(horizontalVelocity) > 500) {
          if (info.offset.x > 0 || horizontalVelocity > 0) {
            // Swipe right - go to home with animation
            controls.start({ x: '100%', transition: { duration: 0.3 } })
              .then(() => navigate('/'));
          } else {
            // Swipe left - prevent default and do nothing
            event?.preventDefault();
            controls.start({ x: 0, transition: { duration: 0.3 } });
          }
        } else {
          // Reset position if threshold not met
          controls.start({ x: 0, transition: { duration: 0.3 } });
        }
      }
      setIsDragging(false);
      setDragY(0);
      setIsHorizontalDrag(false);
      return;
    }

    // Handle horizontal swipe
    if (isHorizontalDrag) {
      const horizontalThreshold = 50;
      const horizontalVelocity = info.velocity.x;

      if (Math.abs(info.offset.x) > horizontalThreshold || Math.abs(horizontalVelocity) > 500) {
        if (info.offset.x > 0 || horizontalVelocity > 0) {
          // Swipe right - go to home with animation
          controls.start({ x: '100%', transition: { duration: 0.3 } })
            .then(() => navigate('/'));
        } else {
          // Swipe left - prevent default and do nothing
          event?.preventDefault();
          controls.start({ x: 0, transition: { duration: 0.3 } });
        }
      } else {
        // Reset position if threshold not met
        controls.start({ x: 0, transition: { duration: 0.3 } });
      }
    } else {
      // Handle vertical swipe only when comments are collapsed
      const threshold = window.innerHeight * 0.3;
      const velocity = info.velocity.y;

      if (Math.abs(info.offset.y) > threshold || Math.abs(velocity) > 500) {
        if (info.offset.y > 0) {
          // Swipe down - go to previous
          goToPreviousSet();
        } else if (info.offset.y < 0) {
          // Swipe up - go to next
          goToNextSet();
        }
      }
    }

    setIsDragging(false);
    setIsHorizontalDrag(false);
    setDragY(0);
  };

  const renderSet = (setData, index, users, userPreferences) => {
    return (
      <motion.div
        key={`set-${setData.id}-${index}`}
        className="aa w-full flex rounded-lg bg-white shadow-lg "
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          y: (index - currentIndex) * (window.innerHeight - 90),
        }}
        initial={false}
        animate={{ y: (index - currentIndex) * (window.innerHeight - 90) + dragY ,
          scale: isDragging && currentIndex===index ?   0.95: 1
        }}
        transition={{
          type: "linear",
          duration: 0.3
        }}
      >
        <div className='bb w-full h-full max-w-3xl flex flex-col rounded-lg  '
        style={{
          backgroundColor: isDragging && currentIndex!==index ? 'rgba(0, 0, 0, '+(1-0.5-(Math.abs(dragY)/window.innerHeight))+')' : 'transparent',
          paddingTop: '20px'
        }}
        >
          <div className="flex-none">
            <Heading setData={setData} />
          </div>
          <div className={`${isCommentsCollapsed(setData.id) ? 'flex-1' : 'h-[12vh]'}`}>
            <Grid
              gridCollapsed={!isCommentsCollapsed(setData.id)}
              setData={setData}
              localOptions={setData.set_items}
              handleVote={(e) => {
                setHasUserInteracted(false);
                handleVote(e);
              }}
              handleReset={handleReset}
            />
          </div>
          {isCommentsCollapsed(setData.id) ? (
            <div className="flex-none">
              <div className="flex flex-col gap-0">
                <CompareButtons
                  totalVotes={setData.totalVotes}
                  setData={setData}
                  handleLikeComparisonSet={handleLikeComparisonSet}
                  voteButtonClicked={(setId) => {
                    // console.log('voteButtonClicked', setId);
                    setMetricsSectionExpanded(!metricsSectionExpanded);
                  }
                  }
                />
                {index === currentIndex && (
                  <AllComments
                    setId={setData.id}
                    commentsCollapsed={isCommentsCollapsed(setData.id)}
                    setCommentsCollapsed={(value) => setCommentsCollapsed(setData.id, value)}
                    items={setData.set_items}
                    users={users}
                    userPreferences={userPreferences}
                  />
                )}
              </div>
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto"
              style={{
                scrollbarWidth: 'none'
              }}
            >
              {index === currentIndex && (
                <AllComments
                  setId={setData.id}
                  commentsCollapsed={isCommentsCollapsed(setData.id)}
                  setCommentsCollapsed={(value) => setCommentsCollapsed(setData.id, value)}
                  items={setData.set_items}
                  users={users}
                  userPreferences={userPreferences}
                />
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col justify-between bg-gray-100 "
    >
    <div className="h-auto rounded-t-sm"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top))'
      }}
    >
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex flex-row min-w-max px-2">
          <div 
            ref={currentSelectedTag === 'home' ? selectedTagRef : null}
            className={`flex flex-row p-2 items-center gap-1 ${currentSelectedTag === 'home' ? 'font-semibold' : ''}`}
            style={{ color: currentSelectedTag === 'home' ? 'rgba(116, 101, 204, 0.87)' : '', cursor: 'pointer' }}
            onClick={() => setCurrentSelectedTag('home')}
          >
            <Home className='inline-block' size={14} /> <span>Feed</span>
          </div>

          <div 
            ref={currentSelectedTag === 'trending' ? selectedTagRef : null}
            className={`flex flex-row p-2 gap-1 items-center ${currentSelectedTag === 'trending' ? 'font-semibold' : ''}`}
            style={{ color: currentSelectedTag === 'trending' ? 'rgba(116, 101, 204, 0.87)' : '', cursor: 'pointer' }}
            onClick={() => setCurrentSelectedTag('trending')}
          >
            <TrendingUp className='inline-block' size={16} /> <span>Trending</span>
          </div>

          {allCategories.slice(0, 3).map((category) => (
            <div
              key={category.name}
              ref={currentSelectedTag === category.name ? selectedTagRef : null}
              className={`flex flex-row p-2 gap-1 ${currentSelectedTag === category.name ? 'font-semibold' : ''}`}
              style={{ color: currentSelectedTag === category.name ? 'rgba(116, 101, 204, 0.87)' : '', cursor: 'pointer' }}
              onClick={() => {setCurrentSelectedTag(category.name)}}
            >
              <span className='whitespace-nowrap'>{category.name}</span>
            </div>
          ))}

          {allCategories.slice(3).map((category) => (
            <div
              key={category.name}
              ref={currentSelectedTag === category.name ? selectedTagRef : null}
              className={`flex flex-row p-2 gap-1 ${currentSelectedTag === category.name ? 'font-semibold' : ''}`}
              style={{ 
                color: currentSelectedTag === category.name 
                  ? 'rgba(116, 101, 204, 0.87)' 
                  : 'rgba(101, 101, 101, 0.87)', 
                cursor: 'pointer' 
              }}
              onClick={() => setCurrentSelectedTag(category.name)}
            >
              <span className='whitespace-nowrap'>{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
      <div className="h-full w-full overflow-hidden "
style={{
      paddingBottom: 'calc(42px + env(safe-area-inset-bottom))'
    }}
      >
        <motion.div
          ref={containerRef}
          className="h-full w-full flex items-center justify-center rounded-lg "
          drag={isCommentsCollapsed(comparisonSets[currentIndex]?.id)}
          dragConstraints={{
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }}
          dragElastic={0.05}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          dragDirectionLock
          animate={controls}
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <AnimatePresence>
            {comparisonSets.map((item, index) => renderSet(item, index, users, userPreferences))}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
};



export default TikTokScroll; 