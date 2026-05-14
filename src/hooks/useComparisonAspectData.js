import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';

export const useComparisonAspectData = (aspectId, setId) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    currentSet: null,
    currentAspectSet: null,
    items: [],
    totalVotes: 0,
    userVoted: false,
    votedItemId: null,
    comparisonMetrics: []
  });

  const fetchData = async () => {
    if (!aspectId || !setId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [setResp, aspectResp] = await Promise.all([
        apiClient.get(`/api/sets/${setId}`),
        apiClient.get(`/api/sets/aspects/${aspectId}`),
      ]);

      const setData = setResp.data.data;
      const aspectData = aspectResp.data.data;

      const rawItems = Array.isArray(setData?.items) ? setData.items : [];
      const aspectVotes = Array.isArray(aspectData?.votes) ? aspectData.votes : [];

      const items = rawItems.map(item => ({
        ...item,
        voteCount: aspectVotes.filter(v => v.item_id === item.id).length,
      }));

      const userVote = aspectVotes.find(v => v.user_id === user?.id);

      // Fetch all aspects for metrics
      const aspectsResp = await apiClient.get(`/api/sets/${setId}/aspects`);
      const allAspects = aspectsResp.data.data ?? [];
      const comparisonMetrics = allAspects.map(a => ({
        ...a,
        userVoted: Array.isArray(a.votes) ? a.votes.some(v => v.user_id === user?.id) : a.user_voted,
      }));

      setData({
        currentSet: setData,
        currentAspectSet: aspectData,
        items,
        totalVotes: aspectVotes.length,
        userVoted: !!userVote,
        votedItemId: userVote?.item_id ?? null,
        comparisonMetrics,
      });
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError(err.response?.data?.error?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (itemId) => {
    if (!user || !aspectId) return false;

    try {
      const { data: resp } = await apiClient.post('/api/votes', { setId: aspectId, itemId });

      await userActivityService.logActivity({
        activityType: ACTIVITY_TYPES.VOTE,
        entityType: ENTITY_TYPES.VOTE,
        entityId: resp.data?.id ?? aspectId,
        pageName: `/compare-aspect-page/${aspectId}`,
        metadata: { itemId, aspectSetId: aspectId, itemName: data.items.find(i => i.id === itemId)?.name },
      });

      setData(prev => ({
        ...prev,
        userVoted: true,
        votedItemId: itemId,
        totalVotes: prev.totalVotes + 1,
        items: prev.items.map(i => ({ ...i, voteCount: i.id === itemId ? i.voteCount + 1 : i.voteCount })),
        comparisonMetrics: prev.comparisonMetrics.map(m =>
          m.id === parseInt(aspectId) ? { ...m, userVoted: true } : m
        ),
      }));

      return true;
    } catch (err) {
      console.error('Error voting:', err);
      setError(err.response?.data?.error?.message ?? err.message);
      return false;
    }
  };

  const handleRevertVote = async () => {
    if (!user || !aspectId || !data.votedItemId) return false;

    try {
      await apiClient.delete('/api/votes', { params: { setId: aspectId } });

      await userActivityService.logActivity({
        activityType: ACTIVITY_TYPES.VOTE_REVERT,
        entityType: ENTITY_TYPES.VOTE,
        entityId: aspectId,
        pageName: `/comparison-aspect-page/${aspectId}`,
        metadata: { itemId: data.votedItemId, aspectSetId: aspectId },
      });

      setData(prev => ({
        ...prev,
        userVoted: false,
        votedItemId: null,
        totalVotes: prev.totalVotes - 1,
        items: prev.items.map(i => ({ ...i, voteCount: i.id === data.votedItemId ? i.voteCount - 1 : i.voteCount })),
        comparisonMetrics: prev.comparisonMetrics.map(m =>
          m.id === parseInt(aspectId) ? { ...m, userVoted: false } : m
        ),
      }));

      return true;
    } catch (err) {
      console.error('Error reverting vote:', err);
      setError(err.response?.data?.error?.message ?? err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [aspectId, setId]);

  return { ...data, loading, error, handleVote, handleRevertVote, refetch: fetchData };
};
