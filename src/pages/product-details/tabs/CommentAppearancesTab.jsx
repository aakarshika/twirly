import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../lib/apiClient';
import { Heart, MessageSquare } from 'lucide-react';
import Button from '../../../components/common/Button';
import Avatar from '../../../components/common/Avatar';

const CommentAppearancesTab = ({ comparisonSets, item }) => {
  const { user } = useAuth();
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
  // console.log("comparisonSets",comparisonSets);
  // console.log("item",item);

  const fetchComments = async () => {
    if (!item?.id) return;
    try {
      setLoading(true);
      const pageSize = 10;
      const { data: resp } = await apiClient.get(`/api/items/${item.id}/comments`, {
        params: { page, pageSize },
      });
      const { comments: newComments, total } = resp.data;

      setComments(prev => page === 1 ? newComments : [...prev, ...newComments]);
      setHasMore(total > page * pageSize);
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message);
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

  const handleLikeComment = async commentId => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    const alreadyLiked = comment.reactions?.some(r => r.user_id === user?.id && r.reaction_type === 'like');
    try {
      if (alreadyLiked) {
        await apiClient.delete(`/api/comments/${commentId}/react`);
        setComments(prev => prev.map(c => c.id === commentId
          ? { ...c, reactions: (c.reactions ?? []).filter(r => !(r.user_id === user?.id && r.reaction_type === 'like')) }
          : c,
        ));
      } else {
        await apiClient.post(`/api/comments/${commentId}/react`, { reactionType: 'like' });
        setComments(prev => prev.map(c => c.id === commentId
          ? { ...c, reactions: [...(c.reactions ?? []), { user_id: user?.id, reaction_type: 'like' }] }
          : c,
        ));
      }
    } catch (err) {
      console.error('Failed to toggle comment like:', err);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
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
      {comments.map(comment => (
        <div key={comment.id} className="rounded-lg p-4 shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Avatar
                profileImageUrl={comment.profile_image_url}
                displayName={comment.display_name}
                size={'sm'}
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.display_name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @ &apos;{comment.set_name}&apos;
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
          <p className="mt-2 text-gray-700 dark:text-gray-300" style={{ textAlign: 'start' }}>
            {comment.content}
          </p>
        </div>
      ))}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            className="mt-4"
          >
            {loading ? 'Loading stuff...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentAppearancesTab;
