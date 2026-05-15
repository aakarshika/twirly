import { motion } from 'framer-motion';
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
  setHasUserInteracted,
}) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  return (
    <div
      className="w-full h-full flex flex-col max-w-2xl mx-auto"
      style={{ background: t.bg, color: t.ink }}
    >
      <div className="flex-none">
        <Heading setData={setData} />
      </div>

      <motion.div
        className="min-h-0"
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
        />
      </div>

      {isActive && (
        <div className={isCommentsCollapsed ? 'flex-none' : 'flex-1 min-h-0 overflow-y-auto'}>
          <AllComments
            setId={setData.id}
            commentsCollapsed={isCommentsCollapsed}
            setCommentsCollapsed={setIsCommentsCollapsed}
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
