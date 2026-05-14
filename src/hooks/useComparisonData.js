import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';

export const useComparisonData = (setId, aspectId = null) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSet, setCurrentSet] = useState(null);
  const [aspects, setAspects] = useState([]);
  const [items, setItems] = useState([]);
  const [votes, setVotes] = useState({});
  const [reactions, setReactions] = useState({});
  const [userVoted, setUserVoted] = useState(false);
  const [votedItemId, setVotedItemId] = useState(null);
  const [aspectVotes, setAspectVotes] = useState({});

  const fetchAllComparisonData = async () => {
    if (!setId) {
      setError('No comparison set ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (aspectId) {
        const { data: aspectResp } = await apiClient.get(`/api/sets/aspects/${aspectId}`);
        const aspectData = aspectResp.data;
        if (!aspectData) throw new Error('Aspect not found');

        const parentSet = aspectData.comparison_sets;
        setCurrentSet(parentSet);
        setItems((parentSet?.comparison_set_items ?? []).map(i => i.items ?? i));

        const aspectVotesList = Array.isArray(aspectData.votes) ? aspectData.votes : [];
        const votesMap = { [aspectId]: aspectVotesList };
        setVotes(votesMap);

        const aspectReactionsList = Array.isArray(aspectData.reactions) ? aspectData.reactions : [];
        setReactions({ [aspectId]: aspectReactionsList });

        const processedAspects = [{ ...aspectData, id: aspectId }].map(a => {
          const av = votesMap[a.id] ?? [];
          const uv = av.find(v => v.user_id === user?.id);
          return { ...a, userVoted: !!uv, votedItemId: uv?.item_id ?? null };
        });
        setAspects(processedAspects);

        if (user) {
          const uv = aspectVotesList.find(v => v.user_id === user.id);
          setUserVoted(!!uv);
          setVotedItemId(uv?.item_id ?? null);
          setAspectVotes({ [aspectId]: { voted: !!uv, itemId: uv?.item_id ?? null } });
        }
      } else {
        const { data: setResp } = await apiClient.get(`/api/sets/${setId}`);
        const setData = setResp.data;
        if (!setData) throw new Error('Comparison not found');
        setCurrentSet(setData);
        setItems(Array.isArray(setData.items) ? setData.items : []);

        const { data: aspectsResp } = await apiClient.get(`/api/sets/${setId}/aspects`);
        const allAspects = aspectsResp.data ?? [];

        const votesMap = {};
        const reactionsMap = {};
        const avMap = {};
        const processedAspects = allAspects.map(a => {
          const av = Array.isArray(a.votes) ? a.votes : [];
          votesMap[a.id] = av;
          const ar = Array.isArray(a.reactions) ? a.reactions : [];
          reactionsMap[a.id] = ar;
          const uv = user ? av.find(v => v.user_id === user.id) : null;
          if (user) avMap[a.id] = { voted: !!uv, itemId: uv?.item_id ?? null };
          return { ...a, userVoted: !!uv, votedItemId: uv?.item_id ?? null };
        });

        setAspects(processedAspects);
        setVotes(votesMap);
        setReactions(reactionsMap);
        if (user) setAspectVotes(avMap);
      }
    } catch (err) {
      console.error('Error in fetchAllComparisonData:', err);
      setError(err.response?.data?.error?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async itemId => {
    if (!user || !aspectId) return;

    try {
      const { data: resp } = await apiClient.post('/api/votes', { setId: aspectId, itemId });

      await userActivityService.logActivity({
        activityType: ACTIVITY_TYPES.VOTE,
        entityType: ENTITY_TYPES.VOTE,
        entityId: resp.data?.id ?? aspectId,
        pageName: `/comparison-aspect-page/${aspectId}`,
        metadata: { itemId, aspectSetId: aspectId, itemName: items.find(i => i.id === itemId)?.name },
      });

      setUserVoted(true);
      setVotedItemId(itemId);
      setVotes(prev => ({ ...prev, [aspectId]: [...(prev[aspectId] ?? []), resp.data] }));
    } catch (err) {
      console.error('Error in handleVote:', err);
      setError(err.response?.data?.error?.message ?? err.message);
    }
  };

  const handleRevertVote = async () => {
    if (!user || !aspectId || !votedItemId) return;

    try {
      await apiClient.delete('/api/votes', { params: { setId: aspectId } });

      await userActivityService.logActivity({
        activityType: ACTIVITY_TYPES.VOTE_REVERT,
        entityType: ENTITY_TYPES.VOTE,
        entityId: aspectId,
        pageName: `/comparison-aspect-page/${aspectId}`,
        metadata: { itemId: votedItemId, aspectSetId: aspectId },
      });

      setUserVoted(false);
      setVotedItemId(null);
      setVotes(prev => ({
        ...prev,
        [aspectId]: (prev[aspectId] ?? []).filter(v => !(v.user_id === user.id && v.item_id === votedItemId)),
      }));
    } catch (err) {
      console.error('Error in handleRevertVote:', err);
      setError(err.response?.data?.error?.message ?? err.message);
    }
  };

  useEffect(() => {
    if (setId) fetchAllComparisonData();
  }, [setId, aspectId]);

  const currentAspectSet = aspectId ? {
    ...aspects.find(a => a.id === aspectId),
    reactions: reactions[aspectId] ?? [],
    userReaction: (reactions[aspectId] ?? []).find(r => r.user_id === user?.id)?.reaction_type,
  } : null;

  const totalVotes = aspectId ? (votes[aspectId] ?? []).length : 0;

  return {
    loading, error, currentSet, currentAspectSet, aspects, items,
    totalVotes, userVoted, votedItemId, aspectVotes,
    handleVote, handleRevertVote, refetch: fetchAllComparisonData,
  };
};
