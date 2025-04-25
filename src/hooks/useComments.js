import { useState, useEffect } from 'react';
import { comparisonSetService } from '../services/comparisonSetService';

export const useComments = (setId, userId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentVisibility, setCommentVisibility] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (setId) {
      fetchComments();
    }
  }, [setId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await comparisonSetService.fetchComments(setId, userId, page);
      setComments(prev => page === 1 ? data.comments : [...prev, ...data.comments]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
    await fetchComments();
  };

  const handleSubmitComment = async (text) => {
    if (!text.trim() || !userId) return;

    try {
      const comment = await comparisonSetService.postComment(setId, userId, text);
      const userPreferences = await comparisonSetService.getUserPreferences(userId);
      
      const enrichedComment = {
        ...comment,
        user: { 
          username: userPreferences?.display_name || 'Someone'
        }
      };

      setComments(prev => [enrichedComment, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!userId) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      const hasLiked = comment.userReaction === 'like';

      await comparisonSetService.toggleLike(commentId, userId, hasLiked);

      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            userReaction: hasLiked ? null : 'like',
            reactions: hasLiked 
              ? c.reactions.filter(r => r.user_id !== userId)
              : [...c.reactions, { user_id: userId, reaction_type: 'like' }]
          };
        }
        return c;
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReply = async (commentId, text) => {
    if (!text.trim() || !userId) return;

    try {
      const reply = await comparisonSetService.postReply(commentId, userId, text);
      const userPreferences = await comparisonSetService.getUserPreferences(userId);

      const enrichedReply = {
        ...reply,
        user: { 
          username: userPreferences?.display_name || 'Someone'
        }
      };

      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [enrichedReply, ...(c.replies || [])]
          };
        }
        return c;
      }));
    } catch (err) {
      setError(err.message);
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
    handleReply,
    loadMore,
    hasMore
  };
}; 