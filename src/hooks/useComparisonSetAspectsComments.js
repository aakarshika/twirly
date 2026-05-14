import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useComments } from './useComments';
import apiClient from '../lib/apiClient';

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
        const { data: resp } = await apiClient.get(`/api/users/${user.id}`);
        setUserPreferences(resp.data);
      } catch (err) {
        console.error('Error fetching user preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

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
    users,
  };
};
