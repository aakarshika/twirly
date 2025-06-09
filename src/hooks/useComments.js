import { useState, useEffect } from 'react';
import { comparisonSetService } from '../services/comparisonSetService';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
    if (!setId) return;
    
    try {
      setLoading(true);
      const data = await comparisonSetService.fetchComments(setId, user?.id, page);
      setComments(prev => page === 1 ? data.comments : [...prev, ...data.comments]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset comments when setId changes
  useEffect(() => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [setId]);

  // Fetch comments only when page changes or setId changes
  useEffect(() => {
    fetchComments();
  }, [setId, page]);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
  };

  const handleSubmitComment = async (text) => {
    // console.log('handleSubmitComment', text);
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
    if (!user?.id) return;
    try {
      const comment = comments.find(c => c.id === commentId);
      const hasLiked = comment?.reactions?.find(r => r.user_id === user.id)?.reaction_type === 'like';

      if (hasLiked) {
        await supabase
          .from('comparison_set_comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        // Log the unlike activity
        await userActivityService.logActivity({
          userId: user.id,
          activityType: ACTIVITY_TYPES.UNLIKE_COMMENT,
          entityType: ENTITY_TYPES.COMMENT,
          entityId: commentId,
          pageName: location.pathname,
          metadata: { comparisonSetId: setId }
        });
      } else {
        await supabase
          .from('comparison_set_comment_reactions')
          .insert([{ comment_id: commentId, user_id: user.id, reaction_type: 'like' }]);

        // Log the like activity
        await userActivityService.logActivity({
          userId: user.id,
          activityType: ACTIVITY_TYPES.LIKE_COMMENT,
          entityType: ENTITY_TYPES.COMMENT,
          entityId: commentId,
          pageName: location.pathname,
          metadata: { comparisonSetId: setId }
        });
      }

      // Update local state
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              reactions: hasLiked
                ? comment.reactions.filter(r => r.user_id !== user.id)
                : [...(comment.reactions || []), { user_id: user.id, reaction_type: 'like' }]
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error('Error toggling comment like:', err);
      setError(err.message);
    }
  };

  const handleLikeReply = async (replyId) => {
    if (!user?.id) return;
    try {
      const reply = comments.flatMap(c => c.replies || []).find(r => r.id === replyId);
      const hasLiked = reply?.reactions?.find(r => r.user_id === user.id)?.reaction_type === 'like';

      if (hasLiked) {
        await supabase
          .from('comparison_set_comment_reactions')
          .delete()
          .eq('reply_id', replyId)
          .eq('user_id', user.id);

        // Log the unlike activity
        await userActivityService.logActivity({
          userId: user.id,
          activityType: ACTIVITY_TYPES.UNLIKE_REPLY,
          entityType: ENTITY_TYPES.REPLY,
          entityId: replyId,
          pageName: location.pathname,
          metadata: { comparisonSetId: setId }
        });
      } else {
        await supabase
          .from('comparison_set_comment_reactions')
          .insert([{ reply_id: replyId, user_id: user.id, reaction_type: 'like' }]);

        // Log the like activity
        await userActivityService.logActivity({
          userId: user.id,
          activityType: ACTIVITY_TYPES.LIKE_REPLY,
          entityType: ENTITY_TYPES.REPLY,
          entityId: replyId,
          pageName: location.pathname,
          metadata: { comparisonSetId: setId }
        });
      }

      // Update local state
      setComments(prevComments => 
        prevComments.map(comment => ({
          ...comment,
          replies: (comment.replies || []).map(reply => {
            if (reply.id === replyId) {
              return {
                ...reply,
                reactions: hasLiked
                  ? reply.reactions.filter(r => r.user_id !== user.id)
                  : [...(reply.reactions || []), { user_id: user.id, reaction_type: 'like' }]
              };
            }
            return reply;
          })
        }))
      );
    } catch (err) {
      console.error('Error toggling reply like:', err);
      setError(err.message);
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
    handleLikeReply,
    handleReply,
    loadMore,
    setLoading,
    setError,
    setPage,
    fetchComments,
    hasMore
  };
}; 