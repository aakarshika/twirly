import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [commentsCollapsed, setCommentsCollapsed] = useState(true);
  const [isHorizontalDrag, setIsHorizontalDrag] = useState(false);
  const containerRef = useRef(null);
  const lastScrollTime = useRef(Date.now());
  const { userPreferences } = useAuth();
  const [users, setUsers] = useState([]);

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
    items, 
    currentIndex, 
    setCurrentIndex,
    hasVoted,
    selectedItemId,
    handleVote,
    handleReset
  } = useComparisonSets(parseInt(currentId) || 0);
  const [previousIndex, setPreviousIndex] = useState(currentIndex);

  const handleDragStart = () => {
    setIsDragging(true);
    setIsHorizontalDrag(false);
  };

  const handleDrag = (event, info) => {
    // Only check for horizontal drag if comments are collapsed
    if (commentsCollapsed && Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      setIsHorizontalDrag(true);
    }
  };

  const handleDragEnd = (event, info) => {
    const now = Date.now();
    // Prevent rapid scrolling
    if (now - lastScrollTime.current < 300) {
      return;
    }
    lastScrollTime.current = now;

    if (isHorizontalDrag && commentsCollapsed) {
      // Handle horizontal swipe
      const horizontalThreshold = 50;
      const horizontalVelocity = info.velocity.x;

      if (Math.abs(info.offset.x) > horizontalThreshold || Math.abs(horizontalVelocity) > 500) {
        if (info.offset.x > 0 || horizontalVelocity > 0) {
          // Swipe right - go to home
          navigate('/');
        } else {
          // Swipe left - prevent default and do nothing
          event?.preventDefault();
        }
      }
    } else {
      // Handle vertical swipe
      const threshold = window.innerHeight * 0.3;
      const velocity = info.velocity.y;

      if (Math.abs(info.offset.y) > threshold || Math.abs(velocity) > 500) {
        if (info.offset.y > 0 && currentIndex > 0) {
          // Swipe down - go to previous
          setCurrentIndex(previousIndex);
          if (items[previousIndex]) {
            navigate(`/compare/${items[previousIndex].id}`, { replace: true });
          }
        } else if (info.offset.y < 0 && currentIndex < items.length - 1) {
          // Swipe up - go to next
          setPreviousIndex(currentIndex);
          setCurrentIndex(currentIndex + 1);
          if (items[currentIndex + 1]) {
            navigate(`/compare/${items[currentIndex + 1].id}`, { replace: true });
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
      className="h-screen w-full flex flex-col"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh',
        width: '100%',
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
      <div className={`${commentsCollapsed ? 'flex-1' : 'h-[12vh]'}`}>
        <Grid 
          gridCollapsed={!commentsCollapsed} 
          totalVotes={setData.totalVotes} 
          localOptions={setData.set_items}
          hasVoted={hasVoted}
          handleVote={handleVote}
          selectedItemId={selectedItemId}
          handleReset={handleReset}
        />
      </div>
      {commentsCollapsed ? (
        <div className="flex-none">
          <div className="flex flex-col gap-0">
            <CompareButtons totalVotes={setData.totalVotes} />
            <AllComments setId={setData.id} commentsCollapsed={commentsCollapsed} setCommentsCollapsed={setCommentsCollapsed} 
            items={setData.set_items}
            users={users}
            userPreferences={userPreferences}
            />
          </div>
        </div>
      ) : (
        <div
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: 'none'
          }}
        >
          <AllComments setId={setData.id} commentsCollapsed={commentsCollapsed} setCommentsCollapsed={setCommentsCollapsed} 
          items={setData.set_items}
          users={users}
          userPreferences={userPreferences}
          />
        </div>
      )}
    </motion.div>
  )};

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <motion.div
        ref={containerRef}
        className="h-full w-full"
        drag
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
        style={{
          position: 'relative',
          height: '100%',
          width: '100%'
        }}
      >
        <AnimatePresence>
          {items.map((item, index) => renderSet(item, index, users, userPreferences))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TikTokScroll; 