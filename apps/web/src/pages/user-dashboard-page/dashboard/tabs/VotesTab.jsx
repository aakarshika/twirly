import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { getUserVotes } from '@services/votes';

const EASE = [0.16, 1, 0.3, 1];

const SkeletonVote = ({ t }) => (
  <motion.div
    animate={{ opacity: [0.5, 0.8, 0.5] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      background: t.bgDeep,
      border: `1px solid ${t.ink}12`,
      borderRadius: 8,
      padding: '14px 16px',
    }}
  >
    <div style={{ height: 16, width: '60%', background: `color-mix(in srgb, ${t.ink} 8%, transparent)`, borderRadius: 4, marginBottom: 10 }} />
    <div style={{ height: 12, width: '40%', background: `color-mix(in srgb, ${t.ink} 6%, transparent)`, borderRadius: 4, marginBottom: 6 }} />
    <div style={{ height: 10, width: '28%', background: `color-mix(in srgb, ${t.ink} 5%, transparent)`, borderRadius: 4 }} />
  </motion.div>
);

const groupByComparison = votes => {
  const map = new Map();
  for (const vote of votes) {
    const id = vote.comparison_sets?.id;
    if (!id) continue;
    if (!map.has(id)) {
      map.set(id, {
        comparisonId: id,
        comparisonName: vote.comparison_sets?.name,
        picks: [],
        latestAt: vote.created_at,
      });
    }
    const group = map.get(id);
    if (vote.voted_for?.name) group.picks.push(vote.voted_for.name);
    if (vote.created_at > group.latestAt) group.latestAt = vote.created_at;
  }
  return Array.from(map.values()).sort((a, b) => (b.latestAt > a.latestAt ? 1 : -1));
};

const VoteGroup = ({ group, t, index }) => {
  const navigate = useNavigate();
  const timeAgo = group.latestAt
    ? formatDistanceToNow(new Date(group.latestAt), { addSuffix: true })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: EASE }}
      onClick={() => navigate(`/compare/${group.comparisonId}`)}
      style={{
        background: t.bgDeep,
        border: `1px solid ${t.ink}15`,
        borderRadius: 8,
        padding: '14px 16px',
        cursor: 'pointer',
      }}
    >
      <h3 style={{
        fontFamily: '"DM Serif Display", serif',
        fontStyle: 'italic',
        fontSize: 17,
        color: t.ink,
        margin: 0,
        marginBottom: 8,
        lineHeight: 1.2,
      }}>
        {group.comparisonName || 'Untitled comparison'}
      </h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {group.picks.map((name, i) => (
          <span
            key={i}
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 13,
              color: t.bg,
              background: t.red,
              borderRadius: 4,
              padding: '2px 8px',
              lineHeight: 1.5,
            }}
          >
            {name}
          </span>
        ))}
      </div>

      {timeAgo && (
        <span style={{
          fontFamily: '"Caveat", cursive',
          fontSize: 13,
          color: t.ink,
          opacity: 0.45,
        }}>
          {timeAgo}
        </span>
      )}
    </motion.div>
  );
};

const VotesTab = ({ userId, isPublic }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError('Sign in to view votes.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await getUserVotes(userId);
        if (!cancelled) setGroups(groupByComparison(data ?? []));
      } catch (err) {
        if (!cancelled) setError('Failed to load votes.');
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return (
      <div className="pt-4 space-y-3">
        {[0, 1, 2, 3].map(i => <SkeletonVote key={i} t={t} />)}
      </div>
    );
  }

  if (error) {
    return (
      <p style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.red, padding: '16px 0' }}>
        {error}
      </p>
    );
  }

  if (groups.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 22, color: t.ink, opacity: 0.5, marginBottom: 8 }}>
          no votes yet.
        </p>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.ink, opacity: 0.45 }}>
          {isPublic
            ? "This user hasn't voted on anything."
            : 'Browse comparisons and cast your first vote.'}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-3">
      {groups.map((group, i) => (
        <VoteGroup key={group.comparisonId} group={group} t={t} index={i} />
      ))}
    </div>
  );
};

export default VotesTab;
