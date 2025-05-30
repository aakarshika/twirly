import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';

// Add cache for fetched data
const dataCache = new Map();

export const useComparisonAspectData = (aspectId, setId) => {
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    currentSet: null,
    currentAspectSet: null,
    items: [],
    totalVotes: 0,
    userVoted: false,
    votedItemId: null,
    comparisonMetrics: []
  });

  const fetchData = useCallback(async () => {
    if (!aspectId || !setId) {
      console.log('Missing required data:', { aspectId, setId });
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = `${setId}-${aspectId}`;
    if (dataCache.has(cacheKey)) {
      setData(dataCache.get(cacheKey));
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching data for aspect:', aspectId, 'set:', setId);
      
      // Fetch both set and aspect data in parallel
      const [setResult, aspectResult] = await Promise.all([
        supabase
          .from('comparison_sets')
          .select(`
            *,
            comparison_set_items(
              id,
              items(
                *
              )
            )
          `)
          .eq('id', setId)
          .single(),
        supabase
          .from('comparison_set_aspects')
          .select(`
            *,
            votes(*)
          `)
          .eq('id', aspectId)
          .single()
      ]);

      if (setResult.error) throw setResult.error;
      if (aspectResult.error) throw aspectResult.error;
      if (!setResult.data) throw new Error('Comparison set not found');
      if (!aspectResult.data) throw new Error('Aspect not found');

      // Process the data
      const items = setResult.data.comparison_set_items.map(item => ({
        ...item.items,
        voteCount: aspectResult.data.votes.filter(vote => vote.item_id === item.items.id).length || 0
      }));
      
      // Calculate user vote status
      const userVote = aspectResult.data.votes.find(vote => vote.user_id === user?.id);
      const userVoted = !!userVote;
      const votedItemId = userVote?.item_id;

      // Calculate total votes
      const totalVotes = aspectResult.data.votes.length;

      // Get all aspects for metrics
      const { data: allAspects, error: aspectsError } = await supabase
        .from('comparison_set_aspects')
        .select(`
          *,
          votes(*)
        `)
        .eq('set_id', setId);

      if (aspectsError) throw aspectsError;

      const comparisonMetrics = allAspects.map(aspect => ({
        ...aspect,
        userVoted: aspect.votes.some(vote => vote.user_id === user?.id)
      }));

      const newData = {
        currentSet: setResult.data,
        currentAspectSet: aspectResult.data,
        items,
        totalVotes,
        userVoted,
        votedItemId,
        comparisonMetrics
      };

      // Cache the data
      dataCache.set(cacheKey, newData);
      setData(newData);

    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [aspectId, setId, user]);

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      dataCache.clear();
    };
  }, []);

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
        pageName: `/compare-aspect-page/${aspectId}`,
        metadata: { 
          itemId,
          aspectSetId: aspectId,
          itemName: data.items.find(item => item.id === itemId)?.name
        }
      });

      // Update local state
      setData(prev => ({
        ...prev,
        userVoted: true,
        votedItemId: itemId,
        totalVotes: prev.totalVotes + 1,
        items: prev.items.map(item => ({
          ...item,
          voteCount: item.id === itemId ? item.voteCount + 1 : item.voteCount
        })),
        comparisonMetrics: prev.comparisonMetrics.map(metric => 
          metric.id === parseInt(aspectId)
            ? { ...metric, userVoted: true }
            : metric
        )
      }));

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
        pageName: `/comparison-aspect-page/${aspectId}`,
        metadata: { 
          itemId: data.votedItemId,
          aspectSetId: aspectId,
          itemName: data.items.find(item => item.id === data.votedItemId)?.name
        }
      });

      // Update local state
      setData(prev => ({
        ...prev,
        userVoted: false,
        votedItemId: null,
        totalVotes: prev.totalVotes - 1,
        items: prev.items.map(item => ({
          ...item,
          voteCount: item.id === data.votedItemId ? item.voteCount - 1 : item.voteCount
        })),
        comparisonMetrics: prev.comparisonMetrics.map(metric => 
          metric.id === parseInt(aspectId)
            ? { ...metric, userVoted: false }
            : metric
        )
      }));

      return true;
    } catch (err) {
      console.error('Error reverting vote:', err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    if (aspectId && setId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [aspectId, setId]);

  return {
    ...data,
    loading,
    error,
    handleVote,
    handleRevertVote,
    refetch: fetchData
  };
}; 