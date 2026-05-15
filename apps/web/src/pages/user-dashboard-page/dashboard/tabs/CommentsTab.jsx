import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { getUserComments } from '@services/comments';
import { renderTextWithMentions } from '@utils/commentUtils';

const EASE = [0.16, 1, 0.3, 1];

const SkeletonComment = ({ t }) => (
  <motion.div
    animate={{ opacity: [0.5, 0.8, 0.5] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      borderLeft: `3px solid ${t.ink}15`,
      paddingLeft: 14,
      paddingBottom: 18,
    }}
  >
    <div style={{ height: 14, width: '55%', background: `color-mix(in srgb, ${t.ink} 8%, transparent)`, borderRadius: 4, marginBottom: 8 }} />
    <div style={{ height: 12, width: '85%', background: `color-mix(in srgb, ${t.ink} 6%, transparent)`, borderRadius: 4, marginBottom: 5 }} />
    <div style={{ height: 12, width: '65%', background: `color-mix(in srgb, ${t.ink} 6%, transparent)`, borderRadius: 4, marginBottom: 8 }} />
    <div style={{ height: 10, width: '28%', background: `color-mix(in srgb, ${t.ink} 5%, transparent)`, borderRadius: 4 }} />
  </motion.div>
);

const CommentCard = ({ comment, t, index }) => {
  const navigate = useNavigate();
  const comparisonName = comment?.comparison_sets?.name;
  const comparisonId = comment?.comparison_sets?.id;
  const timeAgo = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: EASE }}
      style={{
        borderLeft: `3px solid ${t.blue}50`,
        paddingLeft: 14,
        paddingBottom: 18,
      }}
    >
      {comparisonName && (
        <button
          onClick={() => navigate(`/compare/${comparisonId}`)}
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: t.blue,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
            lineHeight: 1.3,
            marginBottom: 6,
            display: 'block',
          }}
        >
          {comparisonName}
        </button>
      )}

      <p
        style={{
          fontFamily: '"Fraunces", serif',
          fontSize: 14,
          color: t.ink,
          lineHeight: 1.55,
          margin: 0,
          marginBottom: timeAgo ? 6 : 0,
        }}
        dangerouslySetInnerHTML={{ __html: renderTextWithMentions(comment.text, []) }}
      />

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

const CommentsTab = ({ userId, isPublic }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError('Sign in to view comments.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await getUserComments(userId);
        if (!cancelled) setComments(data.comments ?? []);
      } catch (err) {
        if (!cancelled) setError('Failed to load comments.');
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
      <div className="pt-4 space-y-2">
        {[0, 1, 2, 3].map(i => <SkeletonComment key={i} t={t} />)}
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

  if (comments.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 22, color: t.ink, opacity: 0.5, marginBottom: 8 }}>
          no comments yet.
        </p>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.ink, opacity: 0.45 }}>
          {isPublic
            ? "This user hasn't left any comments."
            : 'Jump into a comparison and say something.'}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      {comments.map((comment, i) => (
        <CommentCard key={comment.id} comment={comment} t={t} index={i} />
      ))}
    </div>
  );
};

export default CommentsTab;
