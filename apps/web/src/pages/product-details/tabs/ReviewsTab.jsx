import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { getItemReviews, likeReview, unlikeReview, submitReview } from '@services/reviews';
import Avatar from '@components/common/Avatar';
import Button from '@components/common/Button';

const PAGE_SIZE = 10;

const ReviewsTab = ({ item }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!item?.id) return;
    let cancelled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        const { reviews: fetched, hasMore: more } = await getItemReviews(item.id, 1, PAGE_SIZE);
        if (!cancelled) {
          setReviews(fetched ?? []);
          setHasMore(more);
          setCurrentPage(1);
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Failed to load reviews.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [item?.id]);

  const handleLike = async reviewId => {
    if (!user) return;
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    const liked = review.has_liked;
    setReviews(prev => prev.map(r => r.id === reviewId
      ? { ...r, likes: liked ? Math.max(0, (r.likes ?? 0) - 1) : (r.likes ?? 0) + 1, has_liked: !liked }
      : r,
    ));
    try {
      if (liked) {
        await unlikeReview(reviewId);
      } else {
        await likeReview(reviewId);
      }
    } catch {
      setReviews(prev => prev.map(r => r.id === reviewId
        ? { ...r, likes: liked ? (r.likes ?? 0) + 1 : Math.max(0, (r.likes ?? 0) - 1), has_liked: liked }
        : r,
      ));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!draftText.trim() || submitting || !item?.id) return;
    setSubmitting(true);
    try {
      const { review } = await submitReview(item.id, user?.id, draftText.trim());
      if (review) setReviews(prev => [review, ...prev]);
      setDraftText('');
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const loadMore = async () => {
    if (!hasMore || loading || !item?.id) return;
    const next = currentPage + 1;
    try {
      setLoading(true);
      const { reviews: fetched, hasMore: more } = await getItemReviews(item.id, next, PAGE_SIZE);
      setReviews(prev => [...prev, ...(fetched ?? [])]);
      setHasMore(more);
      setCurrentPage(next);
    } catch (err) {
      setError(err.message ?? 'Failed to load more.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="space-y-3 pt-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            style={{
              background: t.bgDeep,
              border: `1px solid ${t.ink}12`,
              borderRadius: 10,
              height: 88,
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.red, padding: '16px 0' }}>
        {error}
      </p>
    );
  }

  if (reviews.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 22, color: t.ink, opacity: 0.45, marginBottom: 8 }}>
          no reviews yet.
        </p>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.4 }}>
          Be the first to share your take on this.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {user && (
        <form
          onSubmit={handleSubmit}
          style={{ borderBottom: `1px solid ${t.ink}12`, paddingBottom: 16, marginBottom: 4 }}
        >
          <textarea
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            placeholder="Write a review…"
            rows={3}
            style={{
              width: '100%',
              fontFamily: '"Fraunces", serif',
              fontSize: 14,
              color: t.ink,
              background: t.bgDeep,
              border: `1px solid ${t.ink}20`,
              borderRadius: 6,
              padding: '10px 12px',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!draftText.trim() || submitting}
              style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 13,
                color: t.bg,
                background: draftText.trim() ? t.ink : `${t.ink}40`,
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                cursor: draftText.trim() && !submitting ? 'pointer' : 'default',
              }}
            >
              {submitting ? 'posting…' : 'post review'}
            </button>
          </div>
        </form>
      )}
      {reviews.map((review, i) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
          style={{
            background: t.bgDeep,
            border: `1px solid ${t.ink}14`,
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <div className="flex items-start gap-3">
            <Avatar
              profileImageUrl={review.profile_image_url}
              displayName={review.display_name ?? 'Anonymous'}
              size="xs"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, fontWeight: 600, color: t.ink }}>
                  {review.display_name ?? 'Anonymous'}
                </span>
                <span style={{ fontFamily: '"Caveat", cursive', fontSize: 11, color: `${t.ink}50` }}>
                  {formatDistanceToNow(new Date(review.created_at ?? new Date()), { addSuffix: true })}
                </span>
              </div>
              <p style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.ink, opacity: 0.85, marginTop: 4, lineHeight: 1.45 }}>
                {review.text}
              </p>
              <button
                type="button"
                onClick={() => handleLike(review.id)}
                className="flex items-center gap-1 mt-2"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: user ? 'pointer' : 'default',
                  padding: 0,
                  color: review.has_liked ? t.red : `${t.ink}50`,
                }}
              >
                <Heart size={12} fill={review.has_liked ? t.red : 'none'} stroke={review.has_liked ? t.red : 'currentColor'} />
                <span style={{ fontFamily: '"Caveat", cursive', fontSize: 12 }}>{review.likes ?? 0}</span>
              </button>
            </div>
          </div>
        </motion.div>
      ))}
      {hasMore && (
        <div className="text-center pt-2">
          <Button onClick={loadMore} disabled={loading} variant="secondary" size="sm">
            {loading ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;
