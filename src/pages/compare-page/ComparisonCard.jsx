import React from 'react';
import { motion } from 'framer-motion';
import Heading from './Heading';
import Grid from './Grid';
import CompareButtons from './CompareButtons';
import AllComments from './AllComments';

/**
 * Card content for a single comparison set in the scroll feed.
 * The outer positioned motion.div (vertical scroll animation) lives in TikTokScroll.
 */
const ComparisonCard = ({
  setData,
  isActive,
  isCommentsCollapsed,
  setIsCommentsCollapsed,
  isDragging,
  currentIndex,
  index,
  handleVote,
  handleReset,
  handleLikeComparisonSet,
  users,
  userPreferences,
  setHasUserInteracted,
}) => {
  return (
    <motion.div
      className="w-full h-full max-w-3xl flex flex-col rounded-lg"
      style={{
        backgroundColor: isDragging && currentIndex !== index
          ? `rgba(0,0,0,${Math.max(0, 0.5 - Math.abs(0) / window.innerHeight)})`
          : 'transparent',
      }}
    >
      {/* Theme-aware top gradient overlay */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-bg/70 to-transparent z-10" />

      <div className="flex-none relative z-20">
        <Heading setData={setData} gridCollapsed={!isCommentsCollapsed} />
      </div>

      <motion.div animate={{ height: isCommentsCollapsed ? '100%' : '12vh' }}>
        <Grid
          gridCollapsed={!isCommentsCollapsed}
          setData={setData}
          localOptions={setData.set_items}
          handleVote={itemId => {
            if (setHasUserInteracted) setHasUserInteracted(false);
            handleVote(itemId);
          }}
          handleReset={handleReset}
        />
      </motion.div>

      {isCommentsCollapsed ? (
        <div className="flex-none pb-safe">
          <div className="flex flex-col gap-0">
            <CompareButtons
              totalVotes={setData.totalVotes}
              setData={setData}
              handleLikeComparisonSet={handleLikeComparisonSet}
              voteButtonClicked={() => {}}
            />
            {isActive && (
              <AllComments
                setId={setData.id}
                commentsCollapsed={isCommentsCollapsed}
                setCommentsCollapsed={setIsCommentsCollapsed}
                items={setData.set_items}
                users={users}
                userPreferences={userPreferences}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isActive && (
            <AllComments
              setId={setData.id}
              commentsCollapsed={isCommentsCollapsed}
              setCommentsCollapsed={setIsCommentsCollapsed}
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

export default ComparisonCard;
