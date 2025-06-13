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
import { splitAndJoin } from '../lib/utils';


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
  const [currentSelectedTag, setCurrentSelectedTag] = useState('user_home_feed_91819');
  const [dragX, setDragX] = useState(0);
  const [opacity, setOpacity] = useState(1);
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

  const [isCommentsCollapsed, setIsCommentsCollapsed] = useState(true);

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
    setIsCommentsCollapsed(true);

    if (currentIndex === 0 || currentIndex == -1) {
      setDragX(0);
      setOpacity(1);
      setIsHorizontalDrag(false);
      setIsDragging(false);
    }

    if (currentIndex >= 0 && comparisonSets[currentIndex]) {
      navigate(`/compare/${comparisonSets[currentIndex].id}`, { replace: true });
    }
  }, [currentIndex, comparisonSets]);

  // Effect to handle tag changes
  // useEffect(() => {
  //   if (currentSelectedTag) {
  //     const cat = allCategories.find(category => (category.name).toLowerCase().trim() === currentSelectedTag.toLowerCase().trim());
  //     const categoryId =  cat && cat.userCat ? cat?.id : null;
  //     const categoryIds =  cat && !cat.userCat ? cat?.included_categories : null;
  //     console.log('🔍 cat', cat, currentSelectedTag, 
  //       categoryId,
  //       categoryIds
  //     );
  //     setCategoryId(categoryId);
  //     setCategoryIds(categoryIds);
  //     setSelectedTag(currentSelectedTag);
  //   }
  // }, [currentSelectedTag, allCategories]);

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
    const cat = allCategories.find(category => (category.name).toLowerCase().trim() === tag.toLowerCase().trim());
    const categoryId =  cat && cat.userCat ? cat?.id : null;
    const categoryIds =  cat && !cat.userCat ? cat?.included_categories : null;
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

  const handleDragStart = (event, info) => {
    setIsDragging(true);
    // Determine initial drag direction
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      setIsHorizontalDrag(true);
    } else {
      setIsHorizontalDrag(false);
    }
  };

  const handleDrag = (event, info) => {
    // Only update the drag values based on the locked direction
    if (isHorizontalDrag) {
      setDragX(info.offset.x);
      setDragY(0);
    } else {
      setDragY(info.offset.y);
      setDragX(0);
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
    if (!isCommentsCollapsed) {
      return;
    }

    // Handle horizontal swipe
    if (isHorizontalDrag) {
      const horizontalThreshold = 50;
      const horizontalVelocity = info.velocity.x;

      if (Math.abs(info.offset.x) > horizontalThreshold || Math.abs(horizontalVelocity) > 500) {
        if (info.offset.x > 0) {
          // Swipe right - go to previous tag
          // Don't allow swipe right if we're on user_home_feed_91819
          if (currentSelectedTag === 'user_home_feed_91819') {
            setDragX(0);
            setIsHorizontalDrag(false);
            setIsDragging(false);
            return;
          }
          
          // Animate dragX state back to 0
          const animateDragX = async () => {
            const duration = 10;
            const startTime = Date.now();
            const startX = dragX;

            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const newX = startX + (progress) * (window.innerWidth - startX);
              setDragX(newX);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                prevTag();
              }
            };
            await animate();
          };
          animateDragX();
        } else {
          // Swipe left - go to next tag
          // Don't allow swipe left if we're on the last category
          const list = ['user_home_feed_91819', 'trending', ...allCategories.map(category => category.name)];
          const isLastCategory = currentSelectedTag === list[list.length - 1];
          
          if (isLastCategory) {
            setDragX(0);
            setIsHorizontalDrag(false);
            setIsDragging(false);
            return;
          }

          const animateDragX = async () => {
            const duration = 10;
            const startTime = Date.now();
            const startX = dragX;

            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const newX = startX - (progress) * (window.innerWidth + startX);
              setDragX(newX);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                nextTag();
              }
            };
            await animate();
          };
          animateDragX();
        }
      } else {
        setIsDragging(false);
        setDragX(0);
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
        setIsDragging(false);
        setDragY(0);
      } else {
        setIsDragging(false);
        setDragY(0);
      }
    }

  };


  useEffect(() => {
    console.log('dragX', dragX, isDragging, isHorizontalDrag);
  }, [dragX]);

  const prevTag = () => {
    const list = ['user_home_feed_91819', 'trending', ...allCategories.map(category => category.name)];
    const index = list.findIndex(category => category === currentSelectedTag);
    if (index > 0) {
      setCurrentSelectedTag(list[index - 1]);
    } else if (currentSelectedTag === 'trending') {
      setCurrentSelectedTag('user_home_feed_91819');
    }
  };

  const nextTag = () => {
    const list = ['user_home_feed_91819', 'trending', ...allCategories.map(category => category.name)];
    const index = list.findIndex(category => category === currentSelectedTag);
    if (index < list.length - 1) {
      setCurrentSelectedTag(list[index + 1]);
    } else if (currentSelectedTag === 'user_home_feed_91819') {
      setCurrentSelectedTag('trending');
    }
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
          // opacity: 0,
        }}
        initial={false}
        animate={{
          y: (index - currentIndex) * (window.innerHeight - 90) + dragY,
          opacity: isDragging && isHorizontalDrag ? 0 : 1,
          scale: isDragging && !isHorizontalDrag && currentIndex === index ? 0.95 : 1
        }}
        transition={{
          type: "linear",
          duration: 0.3
        }}
      >
        <motion.div className='bb w-full h-full max-w-3xl flex flex-col rounded-lg  '
          style={{
            backgroundColor: isDragging && currentIndex !== index ? 'rgba(0, 0, 0, ' + (1 - 0.5 - (Math.abs(dragY) / window.innerHeight)) + ')' : 'transparent',
          }}
        // animate={{
        //   x: isDragging && isHorizontalDrag ? dragX : 0,
        // }}
        >
          <div className="flex-none">
            <Heading setData={setData} gridCollapsed={!isCommentsCollapsed}  />
          </div>
          <motion.div
  animate={{
    height: isCommentsCollapsed ? '100%' : '12vh',
  }}
>
            <Grid
              gridCollapsed={!isCommentsCollapsed}
              setData={setData}
              localOptions={setData.set_items}
              handleVote={(e) => {
                setHasUserInteracted(false);
                handleVote(e);
              }}
              handleReset={handleReset}
            />
          </motion.div>
          {isCommentsCollapsed ? (
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
                    commentsCollapsed={isCommentsCollapsed}
                    setCommentsCollapsed={(value) => setIsCommentsCollapsed(value)}
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
                  commentsCollapsed={isCommentsCollapsed}
                  setCommentsCollapsed={(value) => setIsCommentsCollapsed(value)}
                  items={setData.set_items}
                  users={users}
                  userPreferences={userPreferences}
                />
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col justify-between "
    >
      <div className="h-auto rounded-t-sm bg-gray-100 "
        style={{
          paddingTop: 'calc(env(safe-area-inset-top))'
        }}
      >
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex flex-row min-w-max px-2">
            <div
              ref={currentSelectedTag === 'user_home_feed_91819' ? selectedTagRef : null}
              className={`flex flex-row p-2 items-center gap-1 ${currentSelectedTag === 'user_home_feed_91819' ? 'font-semibold' : ''}`}
              style={{ color: currentSelectedTag === 'user_home_feed_91819' ? 'rgba(116, 101, 204, 0.87)' : '', cursor: 'pointer' }}
              onClick={() => setCurrentSelectedTag('user_home_feed_91819')}
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

            {allCategories.filter(category => category.userCat).slice(0, 3).map((category) => (
              <div
                key={category.name}
                ref={currentSelectedTag === category.name ? selectedTagRef : null}
                className={`flex flex-row p-2 gap-1 ${currentSelectedTag === category.name ? 'font-semibold' : ''}`}
                style={{ color: currentSelectedTag === category.name ? 'rgba(116, 101, 204, 0.87)' : '', cursor: 'pointer' }}
                onClick={() => { setCurrentSelectedTag(category.name) }}
              >
                <span className='whitespace-nowrap'>{category.name}</span>
              </div>
            ))}

            {allCategories.filter(category => !category.userCat).map((category) => (
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
                <span className='whitespace-nowrap'>{splitAndJoin(category.name)}</span>
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
          drag={isCommentsCollapsed}
          dragConstraints={{
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }}
          dragDirectionLock={true}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <AnimatePresence>
            {comparisonSets.length > 0 && comparisonSets.map((item, index) => renderSet(item, index, users, userPreferences))}
            {comparisonSets.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <p className="text-gray-500 text-center">No comparisons for this category yet. <br /> Add some?</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
};



export default TikTokScroll; 