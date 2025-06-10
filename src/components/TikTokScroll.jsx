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


const TikTokScroll = () => {
  const { id: currentId } = useParams();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [commentsCollapsedMap, setCommentsCollapsedMap] = useState({});
  const [isHorizontalDrag, setIsHorizontalDrag] = useState(false);
  const containerRef = useRef(null);
  const lastScrollTime = useRef(Date.now());
  const { userPreferences } = useAuth();
  const [users, setUsers] = useState([]);
  const [metricsSectionExpanded, setMetricsSectionExpanded] = useState(false);
  const controls = useAnimation();

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

  const {   
    comparisonSets, 
    currentIndex, 
    setCurrentIndex,
    handleVote,
    handleReset,
    handleLikeComparisonSet
  } = useComparisonSets(parseInt(currentId) || 0);
  const [previousIndex, setPreviousIndex] = useState(currentIndex);

  useEffect(() => {
    if (comparisonSets.length > 0) {
      setCommentsCollapsedMap(prev => {
        const updated = { ...prev };
        comparisonSets.forEach(item => {
          if (updated[item.id] === undefined) {
            updated[item.id] = true; // or false, depending on your desired default
          }
        });
        return updated;
      });
    }
  }, [comparisonSets]);

  // Helper to get/set per-set collapsed state
  const isCommentsCollapsed = (setId) => commentsCollapsedMap[setId] ?? true;
  const setCommentsCollapsed = (setId, value) => {
    setCommentsCollapsedMap(prev => ({ ...prev, [setId]: value }));
  };

  const handleDragStart = () => {
    setIsDragging(true);
    setIsHorizontalDrag(false);
  };

  const handleDrag = (event, info) => {
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
    if (!isCommentsCollapsed(comparisonSets[currentIndex].id)) {
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
      setIsHorizontalDrag(false);
      return;
    }

    if (isHorizontalDrag) {
      // Handle horizontal swipe
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
        if (info.offset.y > 0 && currentIndex > 0) {
          // Swipe down - go to previous
          setCurrentIndex(previousIndex);
          if (comparisonSets[previousIndex]) {
            navigate(`/compare/${comparisonSets[previousIndex].id}`, { replace: true });
          }
        } else if (info.offset.y < 0 && currentIndex < comparisonSets.length - 1) {
          // Swipe up - go to next
          setPreviousIndex(currentIndex);
          setCurrentIndex(currentIndex + 1);
          if (comparisonSets[currentIndex + 1]) {
            navigate(`/compare/${comparisonSets[currentIndex + 1].id}`, { replace: true });
          }
        }
      }
    }
    
    setIsDragging(false);
    setIsHorizontalDrag(false);
  };

  const renderSet = (setData, index, users, userPreferences) => {
    return (
      <motion.div
        key={`set-${setData.id}-${index}`}
        className="h-screen flex flex-col "
        style={{
          position: 'absolute',
          top: 0,
          height: '100vh',
          y: (index - currentIndex) * window.innerHeight
        }}
        initial={false}
        animate={{ y: (index - currentIndex) * window.innerHeight }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
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
            handleVote={handleVote}
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
      </motion.div>
    );
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-white fixed top-0 left-0 right-0 bottom-0 md:pl-60 lg:pl-60" style={{ paddingTop: 'calc(64px + env(safe-area-inset-top))' }}>
      <motion.div
        ref={containerRef}
        className="h-full w-full flex justify-center items-center"
        drag={isCommentsCollapsed(comparisonSets[currentIndex]?.id)}
        dragConstraints={{ 
          top: 0, 
          bottom: 0, 
          left: 0, 
          right: 0 
        }}
        dragElastic={0.1}
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
  );
};

export default TikTokScroll; 