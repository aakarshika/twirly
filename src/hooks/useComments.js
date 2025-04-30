import { useState } from 'react';
import { comparisonSetService } from '../services/comparisonSetService';

export const useComments = (setId, userId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentVisibility, setCommentVisibility] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await comparisonSetService.fetchComments(setId, userId, page);
      console.log('data', data);
      setComments(prev => page === 1 ? data.comments : [...prev, ...data.comments]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    console.log('loadMore', hasMore, loading);
    if (!hasMore || loading) return;
    console.log('loadMore', hasMore, loading);
    setPage(prev => prev + 1);
    console.log('loadMore', hasMore, loading);
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
          profile_image_url: userPreferences?.profile_image_url,
          display_name: userPreferences?.display_name || 'Someone'
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
      //timeout
      setTimeout(() => {
        console.log('comments', comments);
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReply = async (commentId, text) => {
    console.log('handleReply', commentId, text);
    if (!text.trim() || !userId) return;

    try {
      const reply = await comparisonSetService.postReply(commentId, userId, text);
      const userPreferences = await comparisonSetService.getUserPreferences(userId);

      const enrichedReply = {
        ...reply,
        user: { 
          profile_image_url: userPreferences?.profile_image_url,
          display_name: userPreferences?.display_name || 'Someone'
        }
      };
      console.log('enrichedReply', enrichedReply);

      setComments(prev => {
        console.log('prev', prev);
        return prev.map(c => {
          console.log('c', c);
          if (c.id === commentId) {
            return {
            ...c,
            replies: [enrichedReply, ...(c.replies || [])]
          };
        }
        return c;
      });
    });
      //timeout
      setTimeout(() => {
        console.log('comments', comments);
      }, 1000);
    } catch (err) {
      console.log('error', err);
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
    setLoading,
    setError,
    setPage,
    fetchComments,
    hasMore
  };
}; 