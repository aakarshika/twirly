import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';

export const useComparisonAspectData = (aspectId) => {
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
    if (!aspectId || !user) return;
    
    try {
      setLoading(true);
      
      // Single query to get all needed data
      const { data: aspectData, error: aspectError } = await supabase
        .from('comparison_set_aspects')
        .select(`
          *,
          votes(*),
          comparison_sets(
            *,
            comparison_set_items(
              *,
              items(
                *,
                votes(*)
              )
            ),
            comparison_set_aspects(
              *,
              votes(*)
            )
          )
        `)
        .eq('id', aspectId)
        .single();

      if (aspectError) throw aspectError;
      if (!aspectData) throw new Error('Aspect not found');

      // Process the data
      const currentSet = aspectData.comparison_sets;
      const items = currentSet.comparison_set_items.map(item => ({
        ...item.items,
        votes: item.items.votes || []
      }));
      
      // Calculate user vote status
      const userVote = aspectData.votes.find(vote => vote.user_id === user.id);
      const userVoted = !!userVote;
      const votedItemId = userVote?.item_id;

      // Calculate total votes
      const totalVotes = aspectData.votes.length;

      // Process comparison metrics
      const comparisonMetrics = currentSet.comparison_set_aspects.map(aspect => ({
        ...aspect,
        userVoted: aspect.votes.some(vote => vote.user_id === user.id)
      }));

      setData({
        currentSet,
        currentAspectSet: aspectData,
        items,
        totalVotes,
        userVoted,
        votedItemId,
        comparisonMetrics
      });

    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (itemId) => {
    if (!user || !aspectId) return false;

    try {
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          item_id: itemId,
          set_id: aspectId
        })
        .select();

      if (voteError) throw voteError;

      // Log activity
      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.VOTE,
        entityType: ENTITY_TYPES.VOTE,
        entityId: voteData[0].id,
        pageName: `/comparison-aspect/${aspectId}`,
        metadata: { 
          itemId,
          aspectSetId: aspectId,
          itemName: data.items.find(item => item.id === itemId)?.name
        }
      });


      // Update local state
      setData(prev => {
        const updatedItems = prev.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              votes: [...(item.votes || []), voteData[0]]
            };
          }
          return item;
        });

        const updatedMetrics = prev.comparisonMetrics.map(metric => 
          metric.id === parseInt(aspectId)
            ? { ...metric, userVoted: true }
            : metric
        );

        return {
          ...prev,
          userVoted: true,
          votedItemId: itemId,
          totalVotes: prev.totalVotes + 1,
          items: updatedItems,
          comparisonMetrics: updatedMetrics
        };
      });

      return true;
    } catch (err) {
      console.error('Error voting:', err);
      setError(err.message);
      return false;
    }
  };

  const handleRevertVote = async () => {
    if (!user || !aspectId || !data.votedItemId) return false;

    try {
      const { data: deletedVote, error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', data.votedItemId)
        .eq('set_id', aspectId)
        .select();

      if (deleteError) throw deleteError;

      // Log activity
      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.VOTE_REVERT,
        entityType: ENTITY_TYPES.VOTE,
        entityId: deletedVote[0].id,
        pageName: `/comparison-aspect/${aspectId}`,
        metadata: { 
          itemId: data.votedItemId,
          aspectSetId: aspectId,
          itemName: data.items.find(item => item.id === data.votedItemId)?.name
        }
      });

      // Update local state
      setData(prev => {
        const updatedItems = prev.items.map(item => {
          if (item.id === data.votedItemId) {
            return {
              ...item,
              votes: (item.votes || []).filter(vote => vote.user_id !== user.id)
            };
          }
          return item;
        });

        const updatedMetrics = prev.comparisonMetrics.map(metric => 
          metric.id === parseInt(aspectId)
            ? { ...metric, userVoted: false }
            : metric
        );

        return {
          ...prev,
          userVoted: false,
          votedItemId: null,
          totalVotes: prev.totalVotes - 1,
          items: updatedItems,
          comparisonMetrics: updatedMetrics
        };
      });

      return true;
    } catch (err) {
      console.error('Error reverting vote:', err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [aspectId, user]);

  return {
    ...data,
    loading,
    error,
    handleVote,
    handleRevertVote,
    refetch: fetchData
  };
}; 