import { useState, useEffect } from 'react';
import { comparisonComments } from '../services/comparisonComments';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useComments = setId => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentVisibility, setCommentVisibility] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const location = useLocation();
  const { user, userPreferences } = useAuth();

  const fetchComments = async () => {
    if (!setId) return;
    try {
      setLoading(true);
      const data = await comparisonComments.fetchComments(setId, user?.id, page);
      setComments(prev => page === 1 ? data.comments : [...prev, ...data.comments]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [setId]);

  useEffect(() => { fetchComments(); }, [setId, page]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
  };

  const handleSubmitComment = async text => {
    if (!text.trim() || !user?.id) return;
    try {
      const comment = await comparisonComments.postComment(setId, user.id, text);
      const enrichedComment = {
        ...comment,
        text: comment.content ?? text,
        user: {
          profile_image_url: userPreferences?.profile_image_url,
          display_name: userPreferences?.display_name || 'Someone',
        },
        reactions: [],
        replies: [],
      };
      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.COMMENT,
        entityType: ENTITY_TYPES.COMMENT,
        entityId: comment.id ?? 1,
        pageName: location.pathname,
        metadata: { comparisonSetId: setId },
      });
      setComments(prev => [enrichedComment, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLikeComment = async commentId => {
    if (!user?.id) return;
    try {
      const comment = comments.find(c => c.id === commentId);
      const hasLiked = comment?.reactions?.some(r => r.user_id === user.id && r.reaction_type === 'like');
      await comparisonComments.toggleCommentLike(commentId, user.id, hasLiked);
      await userActivityService.logActivity({
        userId: user.id,
        activityType: hasLiked ? ACTIVITY_TYPES.UNLIKE_COMMENT : ACTIVITY_TYPES.LIKE_COMMENT,
        entityType: ENTITY_TYPES.COMMENT,
        entityId: commentId,
        pageName: location.pathname,
        metadata: { comparisonSetId: setId },
      });
      setComments(prev => prev.map(c => {
        if (c.id !== commentId) return c;
        return {
          ...c,
          reactions: hasLiked
            ? c.reactions.filter(r => r.user_id !== user.id)
            : [...(c.reactions || []), { user_id: user.id, reaction_type: 'like' }],
        };
      }));
    } catch (err) {
      console.error('Error toggling comment like:', err);
    }
  };

  const handleLikeReply = async replyId => {
    if (!user?.id) return;
    try {
      const reply = comments.flatMap(c => c.replies || []).find(r => r.id === replyId);
      const hasLiked = reply?.reactions?.some(r => r.user_id === user.id && r.reaction_type === 'like');
      await comparisonComments.toggleReplyLike(replyId, user.id, hasLiked);
      await userActivityService.logActivity({
        userId: user.id,
        activityType: hasLiked ? ACTIVITY_TYPES.UNLIKE_REPLY : ACTIVITY_TYPES.LIKE_REPLY,
        entityType: ENTITY_TYPES.REPLY,
        entityId: replyId,
        pageName: location.pathname,
        metadata: { comparisonSetId: setId },
      });
      setComments(prev => prev.map(c => ({
        ...c,
        replies: (c.replies || []).map(r => {
          if (r.id !== replyId) return r;
          return {
            ...r,
            reactions: hasLiked
              ? r.reactions.filter(rx => rx.user_id !== user.id)
              : [...(r.reactions || []), { user_id: user.id, reaction_type: 'like' }],
          };
        }),
      })));
    } catch (err) {
      console.error('Error toggling reply like:', err);
    }
  };

  const handleReply = async (commentId, replyText) => {
    if (!replyText.trim() || !user?.id) return;
    try {
      const newReply = await comparisonComments.postReply(commentId, user.id, replyText);
      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.COMMENT_REPLY,
        entityType: ENTITY_TYPES.REPLY,
        entityId: newReply?.id ?? 1,
        pageName: location.pathname,
        metadata: { commentId, comparisonSetId: setId },
      });
      setComments(prev => prev.map(c =>
        c.id === commentId
          ? {
              ...c,
              replies: [...(c.replies || []), {
                ...newReply,
                text: newReply.content,
                user: {
                  profile_image_url: userPreferences?.profile_image_url,
                  display_name: userPreferences?.display_name || 'Someone',
                },
                reactions: [],
              }],
            }
          : c,
      ));
    } catch (err) {
      console.error('Error submitting reply:', err);
    }
  };

  return {
    comments,
    loading,
    error,
    commentVisibility,
    setCommentVisibility,
    handleSubmitComment,
    handleLikeComment,
    handleLikeReply,
    handleReply,
    loadMore,
    setLoading,
    setError,
    setPage,
    fetchComments,
    hasMore,
  };
};
