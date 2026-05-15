import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, MessageSquare, Plus, Star, Activity, RefreshCw } from 'lucide-react';
import { isToday, isYesterday, format, parseISO } from 'date-fns';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { useTheme } from '@contexts/ThemeContext';
import { useLoading } from '../../contexts/LoadingContext';
import { getRecentActivities } from '@services/activity';

const EASE = [0.16, 1, 0.3, 1];

const typeColor = (type, t) => {
  const key = type?.toLowerCase();
  if (key === 'vote') return t.red;
  if (key === 'comment') return t.blue;
  if (key === 'comparison') return t.purple;
  if (key === 'review') return t.mustard;
  return t.ink;
};

const typeIcon = type => {
  const key = type?.toLowerCase();
  if (key === 'vote') return ThumbsUp;
  if (key === 'comment') return MessageSquare;
  if (key === 'comparison') return Plus;
  if (key === 'review') return Star;
  return Activity;
};

const typeLabel = type => {
  const key = type?.toLowerCase();
  if (key === 'vote') return 'voted';
  if (key === 'comment') return 'commented';
  if (key === 'comparison') return 'created';
  if (key === 'review') return 'reviewed';
  return type || 'activity';
};

const dayKey = createdAt => {
  if (!createdAt) return 'earlier';
  const d = parseISO(createdAt);
  if (isToday(d)) return 'today';
  if (isYesterday(d)) return 'yesterday';
  return format(d, 'MMMM d');
};

const SkeletonRow = ({ t }) => (
  <motion.div
    animate={{ opacity: [0.45, 0.75, 0.45] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    className="flex items-start gap-3"
  >
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `color-mix(in srgb, ${t.ink} 8%, transparent)`, flexShrink: 0 }} />
    <div className="flex-1 space-y-1.5 pt-1">
      <div style={{ height: 12, width: '60%', background: `color-mix(in srgb, ${t.ink} 8%, transparent)`, borderRadius: 4 }} />
      <div style={{ height: 10, width: '85%', background: `color-mix(in srgb, ${t.ink} 6%, transparent)`, borderRadius: 4 }} />
      <div style={{ height: 9, width: '30%', background: `color-mix(in srgb, ${t.ink} 5%, transparent)`, borderRadius: 4 }} />
    </div>
  </motion.div>
);

const ActivityRow = ({ activity, t, index }) => {
  const Icon = typeIcon(activity.type);
  const color = typeColor(activity.type, t);
  const label = typeLabel(activity.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.035, 0.28), ease: EASE }}
      className="flex items-start gap-3"
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}18` }}
      >
        <Icon size={15} style={{ color }} aria-hidden />
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            style={{ fontFamily: '"Caveat", cursive', fontSize: 15, color, lineHeight: 1 }}
          >
            {label}
          </span>
        </div>
        <p
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 14,
            lineHeight: 1.45,
            color: t.ink,
            opacity: 0.82,
          }}
          className="truncate"
        >
          {activity.description}
        </p>
        <p
          style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: t.ink, opacity: 0.45, marginTop: 2 }}
        >
          {activity.timestamp}
        </p>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ t }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <p style={{ fontFamily: '"Caveat", cursive', fontSize: 26, color: t.ink, opacity: 0.5 }} className="mb-2">
      nothing yet.
    </p>
    <p style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.ink, opacity: 0.5, maxWidth: 280 }}>
      Your votes, comments, and comparisons will show up here.
    </p>
  </div>
);

const ErrorState = ({ t, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <p style={{ fontFamily: '"Caveat", cursive', fontSize: 24, color: t.red, opacity: 0.85 }} className="mb-3">
      something went wrong.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
      style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.6 }}
    >
      <RefreshCw size={14} aria-hidden />
      try again
    </button>
  </div>
);

const ActivityPage = () => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const { setLoading, setError } = useLoading();
  const [activities, setActivities] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLocalLoading(true);
    setLocalError(null);
    setLoading('activity', true, 'Loading activity...');

    getRecentActivities(50)
      .then(data => { if (mounted) setActivities(data); })
      .catch(() => {
        if (mounted) setLocalError('Failed to load activity. Please try again.');
        setError('activity', 'Failed to load activity.', () => setAttempt(n => n + 1));
      })
      .finally(() => {
        if (mounted) setLocalLoading(false);
        setLoading('activity', false);
      });

    return () => { mounted = false; };
  }, [attempt]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const a of activities) {
      const key = dayKey(a.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return map;
  }, [activities]);

  let rowIndex = 0;

  return (
    <div
      style={{ background: t.bg, color: t.ink, minHeight: '100vh', fontFamily: '"Fraunces", serif' }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-10 pt-6 pb-20">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-6"
        >
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 17, color: t.ink, opacity: 0.55 }}>
            your moves.
          </p>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 6vw, 44px)',
              lineHeight: 1.0,
              color: t.ink,
              margin: 0,
            }}
          >
            activity.
          </h1>
        </motion.div>

        {/* Loading skeletons */}
        {localLoading && (
          <div className="space-y-5">
            {Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} t={t} />)}
          </div>
        )}

        {/* Error */}
        {!localLoading && localError && (
          <ErrorState t={t} onRetry={() => setAttempt(n => n + 1)} />
        )}

        {/* Empty */}
        {!localLoading && !localError && activities.length === 0 && (
          <EmptyState t={t} />
        )}

        {/* Grouped activity list */}
        {!localLoading && !localError && activities.length > 0 && (
          <div className="space-y-8">
            {[...grouped.entries()].map(([day, items]) => (
              <div key={day}>
                <p
                  style={{ fontFamily: '"Caveat", cursive', fontSize: 17, color: t.ink, opacity: 0.5 }}
                  className="mb-4"
                >
                  {day}
                </p>
                <div className="space-y-5">
                  {items.map(activity => {
                    const idx = rowIndex++;
                    return (
                      <ActivityRow key={idx} activity={activity} t={t} index={idx} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
