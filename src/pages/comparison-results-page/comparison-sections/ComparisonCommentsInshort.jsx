import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useComments } from '../../../hooks/useComments';
import { useTheme } from '../../../contexts/ThemeContext';
import Button from '../../../components/common/Button';
import Comment from '../../../components/common/comments/Comment'
import { supabase } from '../../../lib/supabase';
import { useEffect } from 'react';
import LoadingOrError from '../../../components/common/LoadingOrError';

const ComparisonCommentsInshort = ({ aspectSetId, items, aspectSet }) => {
  const { user } = useAuth();
  const {
    comments,
    loading,
    error,
    commentVisibility,
    setCommentVisibility,
    handleSubmitComment,
    handleLikeComment,
    loadMore,
    setLoading,
    setError,
    fetchComments,
    handleReply,
    setPage,
    hasMore
  } = useComments(aspectSetId, user?.id);
  const { currentTheme } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [userPreferences, setUserPreferences] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user preferences
        const { data: profile, error: profileError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        setUserPreferences(profile);
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  useEffect(() => {
    // Fetch users for mentions
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('user_id, display_name, username')
        .limit(10);

      if (!error && data) {
        setUsers(data.map(user => ({
          id: user.user_id,
          display: user.display_name,
          email: user.username
        })));
      }
    };

    fetchUsers();
  }, []);

  const onSubmitComment = () => {
    console.log('onSubmitComment', newComment);
    handleSubmitComment(newComment);
    setNewComment('');
  };
  useEffect(() => {
    if (aspectSetId) {
      setPage(1);
      fetchComments();
    }
  }, [aspectSetId]);

  if (loading) {
    return (
      <LoadingOrError type="loading" />
    );
  }

  if (error) {
    return (
      <LoadingOrError type="error" error={error} />
    );
  }

  return (
    <div className="space-y-2" >
      <div className="text-center w-full" >
        {comments.map((comment) => {
          const toggleVisibility = () => {
            setCommentVisibility(prev => ({
              ...prev,
              [comment.id]: !prev[comment.id]
            }));
          };
          return (
          <div key={comment.id}>

          <Comment
            comment={comment}
            onLike={handleLikeComment}
            onToggleVisibility={toggleVisibility}
            isVisible={commentVisibility[comment.id]}
            items={items}
            users={users}
            handleReply={handleReply}
            userPreferences={userPreferences}
            
          />
          </div>
        )})}

        {hasMore && (
          <div className="text-start ml-4 mb-4" style={{ backgroundColor: 'white', borderRadius: '4px' }}>
            <Button onClick={loadMore} disabled={loading}>
              {loading ? 'Loading comments...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonCommentsInshort;
