import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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

  console.log('useComparisonData - Initial params:', { setId, aspectId });

  const fetchAllComparisonData = async () => {
    if (!setId) {
      setError('No comparison set ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('useComparisonData - Fetching data with params:', { setId, aspectId });

      let setData;
      let votesData = [];
      let reactionsData = [];

      // If we're on an aspect page, fetch that specific aspect first
      if (aspectId) {
        console.log('useComparisonData - Fetching specific aspect:', aspectId);
        const { data: aspectData, error: aspectError } = await supabase
          .from('comparison_set_aspects')
          .select(`
            *,
            comparison_sets(
              id,
              name,
              description,
              category_id,
              created_at,
              categories(name),
              user:user_preferences(*),
              comparison_set_items(
                id, 
                item_id,
                set_id,
                items(*)
              )
            )
          `)
          .eq('id', aspectId)
          .single();

        if (aspectError) {
          throw new Error(`Error fetching aspect: ${aspectError.message}`);
        }
        if (!aspectData) {
          throw new Error('Aspect not found');
        }

        console.log('useComparisonData - aspectData:', aspectData);
        setData = aspectData.comparison_sets;
        
        // Fetch votes for this aspect
        const { data: aspectVotes, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('set_id', aspectId);

        if (votesError) {
          throw new Error(`Error fetching votes: ${votesError.message}`);
        }
        votesData = aspectVotes || [];

        // Fetch reactions for this aspect
        const { data: aspectReactions, error: reactionsError } = await supabase
          .from('comparison_set_comment_reactions')
          .select('*')
          .eq('aspect_set_id', aspectId);

        if (reactionsError) {
          throw new Error(`Error fetching reactions: ${reactionsError.message}`);
        }
        reactionsData = aspectReactions || [];
      } else {
        // Fetch the full comparison set
        const { data: comparisonData, error: setError } = await supabase
          .from('comparison_sets')
          .select(`
            id,
            name,
            description,
            category_id,
            created_at,
            categories(name),
            user:user_preferences(*),
            comparison_set_items(
              id, 
              item_id,
              set_id,
              items(*)
            ),
            comparison_set_aspects(
              id,
              metric_name,
              description,
              set_id
            )
          `)
          .eq('id', setId)
          .single();

        if (setError) {
          throw new Error(`Error fetching comparison set: ${setError.message}`);
        }
        if (!comparisonData) {
          throw new Error('Comparison not found');
        }

        setData = comparisonData;

        // Fetch all votes for all aspects
        const { data: allVotes, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .in('set_id', comparisonData.comparison_set_aspects.map(a => a.id));

        if (votesError) {
          throw new Error(`Error fetching votes: ${votesError.message}`);
        }
        votesData = allVotes || [];

        // Fetch all reactions
        const { data: allReactions, error: reactionsError } = await supabase
          .from('comparison_set_comment_reactions')
          .select('*')
          .in('aspect_set_id', comparisonData.comparison_set_aspects.map(a => a.id));

        if (reactionsError) {
          throw new Error(`Error fetching reactions: ${reactionsError.message}`);
        }
        reactionsData = allReactions || [];
      }

      // Process votes into a map
      const votesMap = votesData.reduce((acc, vote) => {
        if (!acc[vote.set_id]) {
          acc[vote.set_id] = [];
        }
        acc[vote.set_id].push(vote);
        return acc;
      }, {});

      // Process reactions into a map
      const reactionsMap = reactionsData.reduce((acc, reaction) => {
        if (!acc[reaction.aspect_set_id]) {
          acc[reaction.aspect_set_id] = [];
        }
        acc[reaction.aspect_set_id].push(reaction);
        return acc;
      }, {});

      // Set the data
      setCurrentSet(setData);
      setItems(setData.comparison_set_items?.map(setItem => setItem.items) || []);
      
      // Process aspects with user voting status
      const processedAspects = (setData.comparison_set_aspects || [aspectId ? { id: aspectId } : null].filter(Boolean))
        .map(aspect => {
          if (!aspect || !aspect.id) return null;
          const aspectVotes = votesMap[aspect.id] || [];
          const userVote = aspectVotes.find(vote => vote.user_id === user?.id);
          return {
            ...aspect,
            userVoted: !!userVote,
            votedItemId: userVote?.item_id
          };
        })
        .filter(Boolean);
      
      setAspects(processedAspects);
      setVotes(votesMap);
      setReactions(reactionsMap);

      // Process user votes for all aspects
      if (user) {
        const userVotesMap = {};
        Object.entries(votesMap).forEach(([aspectId, votes]) => {
          const userVote = votes.find(vote => vote.user_id === user.id);
          userVotesMap[aspectId] = {
            voted: !!userVote,
            itemId: userVote?.item_id
          };
        });
        setAspectVotes(userVotesMap);

        // Set current aspect voting status
        if (aspectId) {
          const currentAspectVotes = userVotesMap[aspectId] || { voted: false, itemId: null };
          setUserVoted(currentAspectVotes.voted);
          setVotedItemId(currentAspectVotes.itemId);
        }
      }
    } catch (err) {
      console.error('Error in fetchAllComparisonData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (itemId) => {
    if (!user || !aspectId) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          item_id: itemId,
          set_id: aspectId
        })
        .select();

      if (error) {
        throw new Error(`Error voting: ${error.message}`);
      }

      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.VOTE,
        entityType: ENTITY_TYPES.VOTE,
        entityId: data[0].id,
        pageName: `/comparison-aspect/${aspectId}`,
        metadata: { 
          itemId,
          aspectSetId: aspectId,
          itemName: items.find(item => item.id === itemId)?.name
        }
      });

      // Update local state
      setUserVoted(true);
      setVotedItemId(itemId);
      setVotes(prev => ({
        ...prev,
        [aspectId]: [...(prev[aspectId] || []), data[0]]
      }));
    } catch (err) {
      console.error('Error in handleVote:', err);
      setError(err.message);
    }
  };

  const handleRevertVote = async () => {
    if (!user || !aspectId || !votedItemId) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', votedItemId)
        .eq('set_id', aspectId)
        .select();

      if (error) {
        throw new Error(`Error reverting vote: ${error.message}`);
      }

      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.VOTE_REVERT,
        entityType: ENTITY_TYPES.VOTE,
        entityId: data[0].id,
        pageName: `/comparison-aspect/${aspectId}`,
        metadata: { 
          itemId: votedItemId,
          aspectSetId: aspectId,
          itemName: items.find(item => item.id === votedItemId)?.name
        }
      });

      // Update local state
      setUserVoted(false);
      setVotedItemId(null);
      setVotes(prev => ({
        ...prev,
        [aspectId]: (prev[aspectId] || []).filter(vote => 
          !(vote.user_id === user.id && vote.item_id === votedItemId)
        )
      }));
    } catch (err) {
      console.error('Error in handleRevertVote:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (setId) {
      fetchAllComparisonData();
    }
  }, [setId, aspectId]);

  // Get current aspect data if we're in an aspect view
  const currentAspectSet = aspectId ? {
    ...aspects.find(a => a.id === aspectId),
    reactions: reactions[aspectId] || [],
    userReaction: reactions[aspectId]?.find(r => r.user_id === user?.id)?.reaction_type
  } : null;

  // Calculate total votes for current aspect
  const totalVotes = aspectId ? (votes[aspectId] || []).length : 0;

  return {
    loading,
    error,
    currentSet,
    currentAspectSet,
    aspects,
    items,
    totalVotes,
    userVoted,
    votedItemId,
    aspectVotes,
    handleVote,
    handleRevertVote,
    refetch: fetchAllComparisonData
  };
}; 