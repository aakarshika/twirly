import { useState, useEffect } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { getItemComments } from '@services/items';
import { reactToComment, unreactToComment } from '@services/comments';
import Avatar from '@components/common/Avatar';
import Button from '@components/common/Button';

const PAGE_SIZE = 10;

const CommentAppearancesTab = ({ item }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!item?.id) return;
    let cancelled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        const { comments: fetched, hasMore: more } = await getItemComments(item.id, 1, PAGE_SIZE);
        if (!cancelled) {
          setComments(fetched);
          setHasMore(more);
          setCurrentPage(1);
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Failed to load comments.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [item?.id]);

  const loadMore = async () => {
    if (!hasMore || loading || !item?.id) return;
    const next = currentPage + 1;
    try {
      setLoading(true);
      const { comments: fetched, hasMore: more } = await getItemComments(item.id, next, PAGE_SIZE);
      setComments(prev => [...prev, ...fetched]);
      setHasMore(more);
      setCurrentPage(next);
    } catch (err) {
      setError(err.message ?? 'Failed to load more.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async commentId => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    const alreadyLiked = comment.reactions?.some(
      r => r.user_id === user?.id && r.reaction_type === 'like',
    );
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? {
            ...c,
            reactions: alreadyLiked
              ? (c.reactions ?? []).filter(r => !(r.user_id === user?.id && r.reaction_type === 'like'))
              : [...(c.reactions ?? []), { user_id: user?.id, reaction_type: 'like' }],
          }
        : c,
    ));
    try {
      if (alreadyLiked) {
        await unreactToComment(commentId);
      } else {
        await reactToComment(commentId, 'like');
      }
    } catch {
      setComments(prev => prev.map(c =>
        c.id === commentId
          ? {
              ...c,
              reactions: alreadyLiked
                ? [...(c.reactions ?? []), { user_id: user?.id, reaction_type: 'like' }]
                : (c.reactions ?? []).filter(r => !(r.user_id === user?.id && r.reaction_type === 'like')),
            }
          : c,
      ));
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
              height: 76,
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

  if (comments.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 22, color: t.ink, opacity: 0.45, marginBottom: 8 }}>
          no mentions yet.
        </p>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.4 }}>
          Comments from comparisons featuring this item appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map(comment => {
        const liked = comment.reactions?.some(
          r => r.user_id === user?.id && r.reaction_type === 'like',
        );
        return (
          <div
            key={comment.id}
            style={{
              background: t.bgDeep,
              border: `1px solid ${t.ink}14`,
              borderRadius: 10,
              padding: '12px 14px',
            }}
          >
            <div className="flex items-start gap-3">
              <Avatar
                profileImageUrl={comment.profile_image_url}
                displayName={comment.display_name ?? 'Anonymous'}
                size="xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, fontWeight: 600, color: t.ink }}>
                    {comment.display_name ?? 'Anonymous'}
                  </span>
                  {comment.set_name && (
                    <span style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: t.blue }}>
                      in &ldquo;{comment.set_name}&rdquo;
                    </span>
                  )}
                  <span style={{ fontFamily: '"Caveat", cursive', fontSize: 11, color: `${t.ink}50` }}>
                    {formatDistanceToNow(new Date(comment.created_at ?? new Date()), { addSuffix: true })}
                  </span>
                </div>
                <p style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.ink, opacity: 0.85, marginTop: 4, lineHeight: 1.45 }}>
                  {comment.content}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-1"
                    style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: liked ? t.red : `${t.ink}60` }}
                  >
                    <Heart size={12} fill={liked ? t.red : 'none'} stroke={liked ? t.red : 'currentColor'} />
                    {comment.reactions?.length ?? 0}
                  </button>
                  <span
                    className="flex items-center gap-1"
                    style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: `${t.ink}50` }}
                  >
                    <MessageSquare size={12} />
                    {comment.replies?.length ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
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

export default CommentAppearancesTab;
