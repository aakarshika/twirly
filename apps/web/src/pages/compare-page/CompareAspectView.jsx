import React from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useComparisonAspectData } from '@hooks/useComparisonAspectData';
import { SHOW_RESULTS_DURATION } from '@utils/constants';
import ComparisonItemCardAspect from '../comparison-aspect-page/ComparisonItemCard/ComparisonItemCardAspect';
import ComparisonSetAspectsCommentsSection from '../comparison-aspect-page/ComparisonSetAspectsCommentsSection';

const CompareAspectView = ({
  onVoteChange,
  onNextClick,
  celebratingAspectId,
  currentAspect,
  userVotedAll,
  aspectVotes,
}) => {
  const { id: setId } = useParams();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  const { currentAspectSet, items, totalVotes, handleVote, handleRevertVote, loading, error } =
    useComparisonAspectData(currentAspect?.id, setId);

  const userVoted = aspectVotes?.userVoted || false;
  const votedItemId = aspectVotes?.votedItemId || null;
  const isCelebrating = celebratingAspectId === currentAspect?.id;

  const handleVoteWithUpdate = async itemId => {
    const success = await handleVote(itemId);
    if (success) onVoteChange(currentAspect?.id, true, itemId);
  };

  const handleRevertVoteWithUpdate = async () => {
    const success = await handleRevertVote();
    if (success) onVoteChange(currentAspect?.id, false);
  };

  if (error) {
    return (
      <div className="rounded-sm p-6 m-4" style={{ background: t.bgDeep, border: `1px solid ${t.red}40` }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20, color: t.red, lineHeight: 1.1 }}>
          something went wrong.
        </h2>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: `${t.ink}70`, marginTop: 8, lineHeight: 1.5 }}>
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          type="button"
          className="mt-4 rounded-sm"
          style={{ padding: '10px 20px', background: t.red, color: '#fff', fontFamily: '"Fraunces", serif', fontSize: 14, minHeight: 44 }}
        >
          try again
        </button>
      </div>
    );
  }

  if (loading || !items?.length) {
    return (
      <div className="grid grid-cols-2 gap-2 p-3">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="rounded-sm"
            style={{ aspectRatio: '1/1', background: t.bgDeep }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    );
  }

  const gridCols =
    items.length === 1 ? 'grid-cols-1' :
    items.length === 2 ? 'grid-cols-2' :
    items.length % 3 === 0 ? 'grid-cols-3' : 'grid-cols-2';

  const ctaLabel = userVotedAll ? 'see results' : isCelebrating ? 'next aspect…' : 'next aspect';

  return (
    <div className="flex flex-col" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}>
      {/* Item grid */}
      <div className={`grid ${gridCols} gap-2 p-3`}>
        {items.map((item, i) => (
          <ComparisonItemCardAspect
            key={item.id}
            item={item}
            index={i}
            totalVotes={totalVotes}
            userVoted={userVoted}
            votedItemId={votedItemId}
            handleVote={handleVoteWithUpdate}
            handleRevertVote={handleRevertVoteWithUpdate}
          />
        ))}
      </div>

      {/* Next / Results CTA */}
      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={() => !celebratingAspectId && onNextClick()}
          className="relative w-full flex items-center justify-center gap-2 rounded-sm overflow-hidden"
          style={{
            minHeight: 48,
            background: userVoted ? t.red : `${t.ink}12`,
            color: userVoted ? '#fff' : `${t.ink}40`,
            fontFamily: '"Fraunces", serif',
            fontSize: 15,
            cursor: celebratingAspectId ? 'default' : 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {ctaLabel}
          {userVoted && !isCelebrating && <ArrowRight size={15} />}

          <AnimatePresence>
            {isCelebrating && (
              <motion.div
                key="timer-bar"
                className="absolute bottom-0 left-0 h-0.5"
                style={{ background: t.mustard }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: SHOW_RESULTS_DURATION - 1.5, ease: 'linear' }}
              />
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Comments — slide in after voting */}
      <AnimatePresence initial={false}>
        {userVoted && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="px-4 pb-24"
          >
            <ComparisonSetAspectsCommentsSection
              aspectSetId={currentAspect?.id}
              items={items}
              aspectSet={currentAspectSet}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompareAspectView;
