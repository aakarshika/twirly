import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useComments } from './useComments';
import { supabase } from '../lib/supabase';

export const useComparisonSetAspectsComments = (aspectSetId) => {
  const { user } = useAuth();
  const [userPreferences, setUserPreferences] = useState(null);
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

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

  useEffect(() => {
    if (aspectSetId) {
      setPage(1);
      fetchComments();
    }
  }, [aspectSetId]);

  return {
    comments,
    loading,
    error,
    commentVisibility,
    setCommentVisibility,
    handleSubmitComment,
    handleLikeComment,
    loadMore,
    handleReply,
    hasMore,
    userPreferences,
    users
  };
}; 