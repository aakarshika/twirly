import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabase';
import { Heart, MessageSquare } from 'lucide-react';
import Button from '../../common/Button';
import { getPublicUrl } from '../../../lib/utils';

const CommentAppearancesTab = ({ comparisonSets, item }) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (comparisonSets?.length > 0) {
      fetchComments();
    }
  }, [comparisonSets]);
  console.log("comparisonSets",comparisonSets);
  console.log("item",item);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const limit = 10;
      const offset = (page - 1) * limit;

      // Get all comments from comparison sets that include this item
      const { data, error, count } = await supabase
        .from('comparison_set_comments')
        .select(`
          *,
          user:user_preferences(*),
          reactions:comparison_set_comment_reactions(reaction_type, user_id),
          replies:comparison_set_comment_replies(*,user:user_preferences(*)),
          set:comparison_set_aspects(
            *,comparison_sets(
            id,
            name,
            items:comparison_set_items(
              item:items(*)
            )
          )
          )
        `, { count: 'exact' })
        .in('set_id', comparisonSets.map(s=> s.aspects.map(a=> a.id)))
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      console.log("data",data);
      const filteredComments = data;
      console.log("filteredComments",filteredComments);

      setComments(prev => page === 1 ? filteredComments : [...prev, ...filteredComments]);
      setHasMore(count > offset + limit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchComments();
  }, []);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
    await fetchComments();
  };

  const handleLikeComment = async (commentId) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      const hasLiked = comment.reactions?.some(r => r.user_id === user.id && r.reaction_type === 'like');

      if (hasLiked) {
        await supabase
          .from('comparison_set_comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('comparison_set_comment_reactions')
          .insert([{ comment_id: commentId, user_id: user.id, reaction_type: 'like' }]);
      }

      // Update local state
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            reactions: hasLiked
              ? c.reactions.filter(r => r.user_id !== user.id)
              : [...c.reactions, { user_id: user.id, reaction_type: 'like' }]
          };
        }
        return c;
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && page === 1) {
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

  if (comments.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No comments found for this item in any comparison sets.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={getPublicUrl(comment.user?.profile_image_url || '/default-avatar.png')}
                alt={comment.user?.display_name || 'User'}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.user?.display_name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @ '{comment.set.comparison_sets.name}'
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center space-x-1 ${
                  comment.reactions?.some(r => r.user_id === user?.id && r.reaction_type === 'like')
                    ? 'text-red-500'
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart size={16} />
                <span>{comment.reactions?.length || 0}</span>
              </button>
              <div className="flex items-center space-x-1 text-gray-500">
                <MessageSquare size={16} />
                <span>{comment.replies?.length || 0}</span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.text}</p>
          {comment.replies?.length > 0 && (
            <div className="mt-4 space-y-2">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="ml-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <img
                      src={getPublicUrl( reply.user?.profile_image_url || '/default-avatar.png')}
                      alt={reply.user?.display_name || 'User'}
                      className="w-6 h-6 rounded-full"
                    />
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {reply.user?.display_name || 'Anonymous'}
                    </p>
                  </div>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">{reply.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            className="mt-4"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentAppearancesTab; 