import { useState, useEffect } from 'react';
import { comparisonSetService } from '../services/comparisonSetService';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useComments = (setId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentVisibility, setCommentVisibility] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await comparisonSetService.fetchComments(setId, user.id, page);
      setComments(prev => page === 1 ? data.comments : [...prev, ...data.comments]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Fetch initial comments
  useEffect(() => {

    fetchComments();
  }, [setId]);


  const loadMore = async () => {
    console.log('loadMore', hasMore, loading);
    if (!hasMore || loading) return;
    console.log('loadMore', hasMore, loading);
    setPage(prev => prev + 1);
    console.log('loadMore', hasMore, loading);
    await fetchComments();
  };

  const handleSubmitComment = async (text) => {
    console.log('handleSubmitComment', text);
    if (!text.trim() || !user.id) return;

    try {
      const comment = await comparisonSetService.postComment(setId, user.id, text);
      const userPreferences = await comparisonSetService.getUserPreferences(user.id);
      
      const enrichedComment = {
        ...comment,
        user: { 
          profile_image_url: userPreferences?.profile_image_url,
          display_name: userPreferences?.display_name || 'Someone'
        }
      };

      // Log the comment activity
      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.COMMENT,
        entityType: ENTITY_TYPES.COMMENT,
        entityId: 1,
        pageName: location.pathname,
        metadata: { comparisonSetId: setId }
      });

      setComments(prev => [enrichedComment, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user.id) return;
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
      
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        )
      );

      // Log the activity
      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.LIKE_COMMENT,
        entityType: ENTITY_TYPES.COMMENT,
        entityId: 1,
        pageName: location.pathname,
        metadata: { comparisonSetId: setId }
      });
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleReply = async (commentId, replyText) => {
    if (!replyText.trim() || !user.id) return;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/comments/${commentId}/replies`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: replyText })
      // });
      // const newReply = await response.json();

      const newReply = await comparisonSetService.postReply(commentId, user.id, replyText);
      const userPreferences = await comparisonSetService.getUserPreferences(user.id);

      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                  replies: [...(comment.replies ? comment.replies : []), {
                  ...newReply,
                  user: {
                    profile_image_url: userPreferences?.profile_image_url,
                    display_name: userPreferences?.display_name || 'Someone'
                  }
                }]
              }
            : comment
        )
      );

      // Log the reply activity
      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.COMMENT_REPLY,
        entityType: ENTITY_TYPES.REPLY,
        entityId: 1,
        pageName: location.pathname,
          metadata: { commentId, comparisonSetId: setId }
      });
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
    handleReply,
    loadMore,
    setLoading,
    setError,
    setPage,
    fetchComments,
    hasMore
  };
}; 