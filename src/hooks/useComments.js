import { useState } from 'react';
import { comparisonSetService } from '../services/comparisonSetService';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';
import { useLocation } from 'react-router-dom';

export const useComments = (setId, userId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentVisibility, setCommentVisibility] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const location = useLocation();

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

      // Log the comment activity
      await userActivityService.logActivity({
        userId,
        activityType: ACTIVITY_TYPES.COMMENT,
        entityType: ENTITY_TYPES.COMMENT,
        entityId: comment.id,
        pageName: location.pathname,
        metadata: { comparisonSetId: setId }
      });

      setComments(prev => [enrichedComment, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLikeComment = async (commentId, type) => {
    if (!userId) return;
    try {
      if (type === 'Reply') {
        const comment = comments.find(c => c.id === commentId);
        const hasLiked = comment.reactions?.find(r => r.user_id === userId)?.reaction_type === 'like';
        
        await comparisonSetService.toggleCommentLike(commentId, userId, hasLiked);
        
        // Log the activity
        await userActivityService.logActivity({
          userId,
          activityType: hasLiked ? ACTIVITY_TYPES.UNLIKE_COMMENT : ACTIVITY_TYPES.LIKE_COMMENT,
          entityType: ENTITY_TYPES.COMMENT,
          entityId: commentId,
          pageName: location.pathname,
          metadata: { comparisonSetId: setId }
        });

        setComments(prev => prev.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              userReaction: hasLiked ? null : 'like',
              reactions: hasLiked ? c.reactions.filter(r => r.user_id !== userId) : [...c.reactions, { user_id: userId, reaction_type: 'like' }]
            };
          }
          return c;
        }));
      } else if (type === 'LastReply') {
        const comment = comments.find(c => c.replies?.some(r => r.id === commentId));
        const reply = comment?.replies?.find(r => r.id === commentId);
        const hasLiked = reply?.reactions?.find(r => r.user_id === userId)?.reaction_type === 'like';
        
        await comparisonSetService.toggleReplyLike(commentId, userId, hasLiked);
        
        // Log the activity
        await userActivityService.logActivity({
          userId,
          activityType: hasLiked ? ACTIVITY_TYPES.UNLIKE_REPLY : ACTIVITY_TYPES.LIKE_REPLY,
          entityType: ENTITY_TYPES.REPLY,
          entityId: commentId,
          pageName: location.pathname,
          metadata: { 
            commentId: comment.id,
            comparisonSetId: setId 
          }
        });

        setComments(prev => prev.map(c => {
          return {
            ...c,
            replies: c.replies.map(r => {
              if (r.id === commentId) {
                return {
                  ...r,
                  userReaction: hasLiked ? null : 'like',
                  reactions: hasLiked ? r.reactions.filter(r => r.user_id !== userId) : [...r.reactions, { user_id: userId, reaction_type: 'like' }]
                };
              }
              return r;
            })
          };
        }));
      }
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
          profile_image_url: userPreferences?.profile_image_url,
          display_name: userPreferences?.display_name || 'Someone'
        }
      };

      // Log the reply activity
      await userActivityService.logActivity({
        userId,
        activityType: ACTIVITY_TYPES.COMMENT_REPLY,
        entityType: ENTITY_TYPES.REPLY,
        entityId: reply.id,
        pageName: location.pathname,
        metadata: { commentId, comparisonSetId: setId }
      });

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
    setLoading,
    setError,
    setPage,
    fetchComments,
    hasMore
  };
}; 