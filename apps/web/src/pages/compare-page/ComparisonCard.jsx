import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import Heading from './Heading';
import Grid from './Grid';
import CompareButtons from './CompareButtons';
import AllComments from './AllComments';

const ComparisonCard = ({
  setData,
  isActive,
  isCommentsCollapsed,
  setIsCommentsCollapsed,
  handleVote,
  handleReset,
  handleLikeComparisonSet,
  userPreferences,
  hasUserInteracted,
  setHasUserInteracted,
}) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const timerControls = useAnimation();

  // Start / freeze the timer bar based on voted + interaction state
  useEffect(() => {
    if (!isActive || !setData.hasVoted) return;
    if (hasUserInteracted) {
      timerControls.stop();
      return;
    }
    timerControls.set({ scaleX: 1 });
    timerControls.start({ scaleX: 0, transition: { duration: 7, ease: 'linear' } });
  }, [isActive, setData.hasVoted, hasUserInteracted, timerControls]);

  const handleOpenComments = collapsed => {
    setIsCommentsCollapsed(collapsed);
    if (!collapsed) setHasUserInteracted?.(true);
  };

  return (
    <div
      className="w-full h-full flex flex-col max-w-2xl mx-auto"
      style={{ background: t.bg, color: t.ink }}
    >
      {/* Auto-advance timer bar — freezes in place when user interacts */}
      <div className="flex-none relative" style={{ height: 3, background: `${t.ink}12` }}>
        {isActive && setData.hasVoted && (
          <motion.div
            key={`timer-${setData.id}`}
            style={{
              position: 'absolute', inset: 0,
              background: hasUserInteracted ? `${t.ink}30` : t.red,
              transformOrigin: 'left center',
            }}
            animate={timerControls}
          />
        )}
      </div>

      <div className="flex-none">
        <Heading setData={setData} />
      </div>

      <motion.div
        className="min-h-0"
        initial={{ flex: '1 1 auto' }}
        animate={{ flex: isCommentsCollapsed ? '1 1 auto' : '0 0 22%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <Grid
          gridCollapsed={!isCommentsCollapsed}
          setData={setData}
          localOptions={setData.set_items}
          handleVote={itemId => {
            setHasUserInteracted?.(false);
            handleVote(itemId);
          }}
          handleReset={handleReset}
        />
      </motion.div>

      <div className="flex-none">
        <CompareButtons
          totalVotes={setData.totalVotes}
          setData={setData}
          handleLikeComparisonSet={handleLikeComparisonSet}
          onInteract={() => setHasUserInteracted?.(true)}
        />
      </div>

      {isActive && (
        <div className={isCommentsCollapsed ? 'flex-none' : 'flex-1 min-h-0 overflow-y-auto'}>
          <AllComments
            setId={setData.id}
            commentsCollapsed={isCommentsCollapsed}
            setCommentsCollapsed={handleOpenComments}
            items={setData.set_items}
            users={[]}
            userPreferences={userPreferences}
          />
        </div>
      )}
    </div>
  );
};

export default ComparisonCard;
