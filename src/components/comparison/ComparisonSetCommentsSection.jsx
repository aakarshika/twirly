import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { useAuth } from '../../contexts/AuthContext';

const ComparisonSetCommentsSection = ({ setId , items}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [products, setProducts] = useState([]);
  const [commentVisibility, setCommentVisibility] = useState({});

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comparison_set_comments')
        .select(`
          *,
          user:profiles(username),
          reactions:comparison_set_comment_reactions(reaction_type, user_id),
          replies:comparison_set_comment_replies(*,user:profiles(username))
        `)
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const processedComments = data.map(comment => ({
        ...comment,
        userReaction: comment.reactions?.find(r => r.user_id === user?.id)?.reaction_type || null,
        replies: comment.replies || []
      }));
      console.log('Success fetching comments:', processedComments);

      if (data) {
        data.forEach(comment => {
          if (comment.replies) {
            comment.replies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort replies by created_at descending
          }
        });
      }

      setComments(processedComments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeProducts = () => {
    const products = items.map(item => item.name);
    return products;
  }

  useEffect(() => {
    if (setId) {
      fetchComments();
      console.log('items', items);
      setProducts(initializeProducts());
    }
  }, [setId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      console.error('User must be logged in to comment');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comparison_set_comments')
        .insert([
          {
            set_id: setId,
            user_id: user.id,
            text: newComment.trim()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setComments(prev => [ data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError(err.message);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      console.error('User must be logged in to like comments');
      return;
    }

    try {
      const comment = comments.find(c => c.id === commentId);
      const hasLiked = comment.userReaction === 'like';

      if (hasLiked) {
        // Remove like
        await supabase
          .from('comparison_set_comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Add like
        await supabase
          .from('comparison_set_comment_reactions')
          .insert([
            {
              comment_id: commentId,
              user_id: user.id,
              reaction_type: 'like'
            }
          ]);
      }

      // Update local state
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            userReaction: hasLiked ? null : 'like',
            reactions: hasLiked ? c.reactions.filter(r => r.user_id !== user.id) : [...c.reactions, { user_id: user.id, reaction_type: 'like' }]
          };
        }
        return c;
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
      setError(err.message);
    }
  };

  const handleReply = async (commentId, replyText) => {
    if (!replyText.trim()) return;

    if (!user) {
      console.error('User must be logged in to reply to comments');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comparison_set_comment_replies')
        .insert([
          {
            parent_comment_id: commentId,
            user_id: user.id,
            text: replyText.trim()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update local state to include the new reply
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [data, ...c?.replies] // Add the new reply to the existing replies
          };
        }
        return c;
      }));
    } catch (err) {
      console.error('Error posting reply:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading comments: {error}
      </div>
    );
  }

  return (
    <div >
      <CommentForm newComment={newComment} setNewComment={setNewComment} handleSubmitComment={handleSubmitComment} />
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-300 dark:border-gray-600 pb-4">
            <CommentList
              comment={comment}
              handleLikeComment={handleLikeComment}
              handleReply={handleReply}
              commentVisibility={commentVisibility}
              setCommentVisibility={setCommentVisibility}
              products={products}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonSetCommentsSection;
