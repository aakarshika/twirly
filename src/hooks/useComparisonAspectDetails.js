import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';

export const useComparisonAspectDetails = (id) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSet, setCurrentSet] = useState(null);
  const [currentAspectSet, setCurrentAspectSet] = useState(null);
  const [items, setItems] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVoted, setUserVoted] = useState(false);
  const [votedItemId, setVotedItemId] = useState(null);

  const fetchComparisonDetails = async () => {
    try {
      setLoading(true);
      const comparisonId = parseInt(id);
      if (isNaN(comparisonId)) throw new Error('Invalid comparison aspect set ID');

      const { data: resp } = await apiClient.get(`/api/sets/aspects/${comparisonId}`);
      const aspectData = resp.data;
      if (!aspectData) throw new Error('Comparison not found');

      const parentSet = aspectData.comparison_sets;
      setCurrentSet(parentSet);

      const userReaction = Array.isArray(aspectData.reactions)
        ? aspectData.reactions.find(r => r.user_id === user?.id)?.reaction_type
        : null;
      setCurrentAspectSet({ ...aspectData, userReaction });

      const rawItems = Array.isArray(parentSet?.comparison_set_items) ? parentSet.comparison_set_items : [];
      setItems(rawItems);

      const aspectVotes = Array.isArray(aspectData.votes) ? aspectData.votes : [];
      setTotalVotes(aspectVotes.length);

      if (user) {
        const userVote = aspectVotes.find(v => v.user_id === user.id);
        setUserVoted(!!userVote);
        setVotedItemId(userVote?.item_id ?? null);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async (compId) => {
    const { data: resp } = await apiClient.get(`/api/sets/aspects/${compId}`);
    return resp.data;
  };

  const fetchRemainingAspects = async (aspectId) => {
    const { data: resp } = await apiClient.get(`/api/sets/aspects/${aspectId}/remaining`);
    return resp.data ?? [];
  };

  const handleVote = async (itemId) => {
    try {
      const { data: resp } = await apiClient.post('/api/votes', { setId: id, itemId });

      await userActivityService.logActivity({
        activityType: ACTIVITY_TYPES.VOTE,
        entityType: ENTITY_TYPES.VOTE,
        entityId: resp.data?.id ?? id,
        pageName: `/comparison-aspect-page/${id}`,
        metadata: { itemId, aspectSetId: id },
      });
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setUserVoted(true);
      setVotedItemId(itemId);
    }
  };

  const handleLikeComparisonAspectSet = async (aspectId, type) => {
    try {
      const hasLiked = currentAspectSet?.userReaction === 'like';

      if (hasLiked) {
        await apiClient.delete(`/api/sets/aspects/${aspectId}/reactions`);
        await userActivityService.logActivity({
          activityType: ACTIVITY_TYPES.UNLIKE_ASPECT_SET,
          entityType: ENTITY_TYPES.ASPECT_SET,
          entityId: aspectId,
          pageName: `/comparison-aspect-page/${aspectId}`,
        });
      } else {
        await apiClient.post(`/api/sets/aspects/${aspectId}/reactions`, { reactionType: 'like' });
        await userActivityService.logActivity({
          activityType: ACTIVITY_TYPES.LIKE_ASPECT_SET,
          entityType: ENTITY_TYPES.ASPECT_SET,
          entityId: aspectId,
          pageName: `/comparison-aspect-page/${aspectId}`,
        });
      }

      setCurrentAspectSet(prev => ({
        ...prev,
        userReaction: hasLiked ? null : 'like',
        reactions: hasLiked
          ? (prev.reactions ?? []).filter(r => r.user_id !== user?.id)
          : [...(prev.reactions ?? []), { user_id: user?.id, reaction_type: 'like' }],
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleNext = () => {
    userActivityService.logActivity({
      activityType: ACTIVITY_TYPES.ASPECT_SET_NEXT,
      entityType: ENTITY_TYPES.ASPECT_SET,
      entityId: id,
      pageName: `/comparison-aspect-page/${id}`,
    });
  };

  const handleRevertVote = async () => {
    try {
      await apiClient.delete('/api/votes', { params: { setId: id } });

      await userActivityService.logActivity({
        activityType: ACTIVITY_TYPES.VOTE_REVERT,
        entityType: ENTITY_TYPES.VOTE,
        entityId: id,
        pageName: `/comparison-aspect-page/${id}`,
        metadata: { itemId: votedItemId, aspectSetId: id },
      });
    } catch (err) {
      console.error('Error reverting vote:', err);
    } finally {
      setUserVoted(false);
      setVotedItemId(null);
    }
  };

  return {
    loading, error, items, currentSet, currentAspectSet,
    reviews: [], averageMetrics: [],
    totalVotes, userVoted, votedItemId,
    handleVote, handleRevertVote, fetchComparisonDetails,
    handleLikeComparisonAspectSet, handleNext,
    fetchRemainingAspects, fetchComparison,
  };
};
