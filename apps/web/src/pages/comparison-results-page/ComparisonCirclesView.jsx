import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { findWinner, findRunnerUp, countTotalVotes, calculateProcessedItems } from '../../services/comparisonResults';
import Avatar from '../../components/common/Avatar';
import { getPublicUrl } from '../../lib/utils';
import ComparisonCircle from './ComparisonCircle';

const AnnouncementBanner = ({ text, t }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3 }}
    className="flex justify-center pb-3"
  >
    <span
      className="px-5 py-2 rounded-sm"
      style={{
        background: t.mustard,
        fontFamily: '"DM Serif Display", serif',
        fontStyle: 'italic',
        fontSize: 17,
        color: t.ink,
      }}
    >
      {text}
    </span>
  </motion.div>
);

const ComparisonCirclesView = ({ items, comparisonMetrics, comparison, userVotedAll, celebratingResults }) => {
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  const displayItems = calculateProcessedItems(items, comparisonMetrics);
  const winner = userVotedAll ? findWinner(displayItems) : null;
  const runnerUp = userVotedAll ? findRunnerUp(displayItems) : null;
  const totalVotes = userVotedAll ? countTotalVotes(comparisonMetrics) : null;

  const [revealPhase, setRevealPhase] = useState(celebratingResults ? 'winner' : 'all');

  useEffect(() => {
    if (celebratingResults) {
      setRevealPhase('winner');
      const t1 = setTimeout(() => setRevealPhase('runnerUp'), 3000);
      const t2 = setTimeout(() => setRevealPhase('all'), 6000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setRevealPhase('all');
    }
  }, [celebratingResults]);

  const revealedItems =
    revealPhase === 'winner'   ? displayItems.slice(0, 1) :
    revealPhase === 'runnerUp' ? displayItems.slice(1, 2) :
    displayItems;

  const gridCols =
    revealedItems.length === 1               ? 'grid-cols-1' :
    revealedItems.length === 2               ? 'grid-cols-2' :
    revealedItems.length % 3 === 0           ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="w-full flex flex-col">
      {!userVotedAll && (
        <p className="text-center py-3" style={{ fontFamily: '"Caveat", cursive', fontSize: 15, color: `${t.ink}55` }}>
          vote on all aspects to reveal results
        </p>
      )}

      <div className="p-3">
        <AnimatePresence mode="wait">
          {revealPhase === 'winner' && (
            <AnnouncementBanner key="winner-banner" text="and the winner is…" t={t} />
          )}
          {revealPhase === 'runnerUp' && (
            <AnnouncementBanner key="runner-banner" text="runner-up goes to…" t={t} />
          )}
        </AnimatePresence>

        <div className={`grid ${gridCols} gap-2`}>
          {revealedItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <ComparisonCircle
                item={item}
                index={i}
                comparison={comparison}
                winner={winner}
                runnerUp={runnerUp}
                totalVotes={totalVotes}
                userVotedAll={userVotedAll}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Creator info */}
      {comparison.user && (
        <div className="flex items-center gap-3 px-4 pb-4 pt-1">
          <Avatar
            profileImageUrl={comparison.user.profile_image_url ? getPublicUrl(comparison.user.profile_image_url) : null}
            displayName={comparison.user.display_name}
            username={comparison.user.username}
            size="sm"
            isEditable={false}
          />
          <button
            type="button"
            className="flex flex-col text-left"
            onClick={() => navigate(`/user/${comparison.user.display_name}`)}
          >
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: `${t.ink}70` }}>
              created by{' '}
              <span style={{ color: t.ink, fontWeight: 600 }}>
                {comparison.user.display_name || 'Anonymous'}
              </span>
            </span>
            {comparison.created_at && (
              <span style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: `${t.ink}50` }}>
                {formatDistanceToNow(new Date(comparison.created_at), { addSuffix: true })}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ComparisonCirclesView;
