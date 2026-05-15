import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { getUserReviews } from '@services/reviews';
import ReviewCard from './ReviewCard';

const SkeletonReview = ({ t }) => (
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
    <div style={{ height: 18, width: '50%', background: `color-mix(in srgb, ${t.ink} 8%, transparent)`, borderRadius: 4, marginBottom: 6 }} />
    <div style={{ height: 12, width: '25%', background: `color-mix(in srgb, ${t.ink} 6%, transparent)`, borderRadius: 4, marginBottom: 12 }} />
    <div style={{ height: 12, width: '92%', background: `color-mix(in srgb, ${t.ink} 6%, transparent)`, borderRadius: 4, marginBottom: 5 }} />
    <div style={{ height: 12, width: '78%', background: `color-mix(in srgb, ${t.ink} 6%, transparent)`, borderRadius: 4, marginBottom: 10 }} />
    <div style={{ height: 10, width: '22%', background: `color-mix(in srgb, ${t.ink} 5%, transparent)`, borderRadius: 4 }} />
  </motion.div>
);

const ReviewsTab = ({ userId, isPublic }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError('Sign in to view reviews.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await getUserReviews(userId);
        if (!cancelled) setReviews(data);
      } catch (err) {
        if (!cancelled) setError('Failed to load reviews.');
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
        {[0, 1, 2].map(i => <SkeletonReview key={i} t={t} />)}
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

  if (reviews.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 22, color: t.ink, opacity: 0.5, marginBottom: 8 }}>
          no reviews yet.
        </p>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.ink, opacity: 0.45 }}>
          {isPublic
            ? "This user hasn't written any reviews."
            : 'Write a review on a comparison to see it here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-3">
      {reviews.map((review, i) => (
        <ReviewCard key={review.id} review={review} index={i} />
      ))}
    </div>
  );
};

export default ReviewsTab;
