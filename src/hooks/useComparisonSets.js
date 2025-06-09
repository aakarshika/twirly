import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';

const BATCH_SIZE = 5;

export const useComparisonSets = (initialId) => {
  const { user } = useAuth();
  const [comparisonSets, setComparisonSets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [lastLoadedIndex, setLastLoadedIndex] = useState(0);
  const currentSetIdRef = useRef(null);
  const loadedSetsRef = useRef(new Set());
  const isInitialLoadDone = useRef(false);

  const isPreloading = useRef(false);

  const getPercentAndWinner = (comparisonSets, totalVotes) => {
    comparisonSets.forEach(opt => {
      opt.votesPercentage = opt.votes / totalVotes * 100;
    });
    const winner = comparisonSets.reduce((max, opt) => opt.votesPercentage > max.votesPercentage ? opt : max);
    comparisonSets.forEach(opt => {
      opt.winner = opt.name === winner.name;
    });
    return comparisonSets;
  };

  const fetchSetDetails = async (setId) => {
    // console.log('🔍 Fetching set details for ID:', setId);
    try {
      const { data, error } = await supabase
        .from('comparison_sets')
        .select('*, comparison_set_items!inner(items(*)), user_preferences(*)')
        .eq('id', setId)
        .single();
      
      if (data) {
        // console.log('✅ Successfully fetched set:', setId);
        return {
          ...data,
          user_name: data.user_preferences.display_name,
          user_profile_image_url: data.user_preferences.profile_image_url,
          set_items: data.comparison_set_items.map(item => ({
            ...item.items,
            votes: 0,
            votesPercentage: 0,
            winner: false
          })),
          hasVoted: false,
          votedItemId: null,
          hasLiked: false,
          likeCount: 0,
          totalVotes: 0
        };
      }
      // console.log('❌ No data found for set:', setId);
      return null;
    } catch (err) {
      console.error('❌ Error fetching set:', setId, err);
      return null;
    }
  };

  const loadVotesAndLikes = async (setId) => {
    // console.log('🎯 Loading votes and likes for set:', setId);
    if (!setId) {
      // console.log('⏭️ Skipping votes/likes load - invalid ID');
      return;
    }
    if (setId === currentSetIdRef.current) {
      // console.log('⏭️ Skipping votes/likes load - already loaded');
      return;
    }
    currentSetIdRef.current = setId;
    
    try {
      // Fetch votes for all items in parallel
      const { data: setData } = await supabase
        .from('comparison_sets')
        .select('comparison_set_items!inner(items(id))')
        .eq('id', setId)
        .single();

      if (!setData) {
        // console.log('❌ No set data found for votes/likes:', setId);
        return;
      }

      // console.log('📊 Fetching votes for set:', setId);
      const votesPromises = setData.comparison_set_items.map(async (item) => {
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact' })
          .eq('set_id', setId)
          .eq('item_id', item.items.id);
        return { itemId: item.items.id, votes: count || 0 };
      });

      const itemsWithVotes = await Promise.all(votesPromises);
      const totalVotes = itemsWithVotes.reduce((acc, item) => acc + item.votes, 0) || 0;
      // console.log('✅ Votes loaded for set:', setId, 'Total votes:', totalVotes);

      // Check if current user has voted
      let hasVoted = false;
      let votedItemId = null;
      if (user) {
        const { data: userVote } = await supabase
          .from('votes')
          .select('item_id')
          .eq('set_id', setId)
          .eq('user_id', user.id)
          .single();

        hasVoted = !!userVote;
        votedItemId = userVote?.item_id || null;
        // console.log('👤 User vote status:', { hasVoted, votedItemId });
      }

      // Fetch likes
      const { count: likeCount } = await supabase
        .from('comparison_set_comment_reactions')
        .select('reaction_type', { count: 'exact' })
        .eq('set_id', setId);

      // Check if user has liked
      let hasLiked = false;
      if (user) {
        const { data: userLike } = await supabase
          .from('comparison_set_comment_reactions')
          .select('*')
          .eq('set_id', setId)
          .eq('user_id', user.id)
          .single();
        hasLiked = !!userLike;
      }
      // console.log('❤️ Likes loaded:', { likeCount, hasLiked });

      // Update the set with votes and likes
      setComparisonSets(prev => prev.map(set => {
        if (set.id === setId) {
          const updatedItems = set.set_items.map(item => {
            const voteData = itemsWithVotes.find(v => v.itemId === item.id);
            return {
              ...item,
              votes: voteData?.votes || 0
            };
          });

          return {
            ...set,
            set_items: getPercentAndWinner(updatedItems, totalVotes),
            hasVoted,
            votedItemId,
            hasLiked,
            likeCount: likeCount || 0,
            totalVotes
          };
        }
        return set;
      }));
      // console.log('✅ Updated set with votes and likes:', setId);
    } catch (err) {
      console.error('❌ Error loading votes and likes:', setId, err);
    }
  };

  const loadSetIfNeeded = async (setId) => {
    // console.log('🔍 Checking if set needs to be loaded:', setId);
    if (loadedSetsRef.current.has(setId)) {
      // console.log('⏭️ Set already loaded:', setId);
      return;
    }

    try {
      const setData = await fetchSetDetails(setId);
      if (setData) {
        // console.log('📥 Adding new set to state:', setId);
        setComparisonSets(prev => [...prev, setData]);
        loadedSetsRef.current.add(setId);
        setLastLoadedIndex(Math.max(lastLoadedIndex, setId));
        // console.log('✅ Set loaded and added to state:', setId);
      }
    } catch (err) {
      console.error('❌ Error loading set:', setId, err);
    }
  };

  // Initial load - only runs once when the component mounts
  useEffect(() => {
    // console.log('🚀 Initial load with ID:', initialId);
    if (!initialId || isInitialLoadDone.current) return;

    const loadInitialData = async () => {
      try {
        // Load the initial set
        // console.log('📥 Loading initial set:', initialId);
        const initialSet = await fetchSetDetails(initialId);
        if (!initialSet) return;

        // Load the next 4 sets
        // console.log('📥 Loading next 4 sets starting from:', initialId + 1);
        const nextSetPromises = Array.from({ length: BATCH_SIZE - 1 }, (_, i) => 
          fetchSetDetails(initialId + i + 1)
        );
        
        const nextSets = (await Promise.all(nextSetPromises)).filter(Boolean);
        // console.log('✅ Loaded next sets:', nextSets.map(s => s.id));
        
        // Combine all sets
        const allSets = [initialSet, ...nextSets];
        // console.log('📦 All sets loaded:', allSets.map(s => s.id));
        setComparisonSets(allSets);
        setLastLoadedIndex(initialId + nextSets.length);
        
        // Mark all sets as loaded
        allSets.forEach(set => loadedSetsRef.current.add(set.id));
        // console.log('📝 Marked sets as loaded:', Array.from(loadedSetsRef.current));
        
        // Set current index to 0 since this is the initial set
        setCurrentIndex(0);
        isInitialLoadDone.current = true;
        // console.log('🎯 Set current index to 0 and current set ID to:', initialId);
      } catch (err) {
        console.error('❌ Error loading initial data:', err);
      }
    };

    loadInitialData();
  }, [initialId]);

  // Load votes and likes for current set
  useEffect(() => {
    // console.log('🔄 Current index changed to:', currentIndex);
    if (comparisonSets[currentIndex]) {
      // console.log('📊 Loading votes/likes for current set:', comparisonSets[currentIndex].id);
      loadVotesAndLikes(comparisonSets[currentIndex].id);
    }
  }, [currentIndex]);

  // Load next set if needed
  useEffect(() => {
    // console.log('🔍 Checking if next set needs to be loaded');
    if (!isInitialLoadDone.current) {
      // console.log('⏭️ Skipping - initial load not done');
      return;
    }

    const currentSet = comparisonSets[currentIndex];
    if (!currentSet) {
      // console.log('❌ No current set found');
      return;
    }

    // If we're at the last set of our loaded sets, load the next one
    if (currentIndex === comparisonSets.length - 1) {
      // console.log('📥 Loading next set:', currentSet.id + 1);
      loadSetIfNeeded(currentSet.id + 1);
    } else {
      // console.log('⏭️ Not at last set, skipping next set load');
    }
  }, [currentIndex, comparisonSets]);

  const updateSetVotes = (set, votedItemId, isAdding) => {
    const updatedItems = set.set_items.map(item => ({
      ...item,
      votes: isAdding && item.id === votedItemId ? item.votes + 1 : item.votes
    }));
    const totalVotes = updatedItems.reduce((acc, item) => acc + item.votes, 0);
    return {
      set_items: getPercentAndWinner(updatedItems, totalVotes),
      totalVotes
    };
  };

  const handleVote = async (itemId) => {
    if (!user || !comparisonSets[currentIndex]) return;
    
    const currentSet = comparisonSets[currentIndex];
    if (currentSet.hasVoted) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          item_id: itemId,
          set_id: currentSet.id
        })
        .select();

      if (error) throw error;

      // Update the local state with the new vote
      setComparisonSets(prev => 
        prev.map((set, i) => 
          i === currentIndex ? { ...set, hasVoted: true, votedItemId: itemId, ...updateSetVotes(set, itemId, true) } : set
        )
      );

      // Log the vote activity
      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.VOTE,
        entityType: ENTITY_TYPES.COMPARISON_SET,
        entityId: currentSet.id,
        pageName: `/compare/${currentSet.id}`,
        metadata: { 
          comparisonSetId: currentSet.id,
          votedItemId: itemId
        }
      });

    } catch (error) {
      console.error('Error voting:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleReset = async () => {
    if (!user || !comparisonSets[currentIndex]) return;
    
    const currentSet = comparisonSets[currentIndex];
    if (!currentSet.hasVoted || !currentSet.votedItemId) return;

    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('set_id', currentSet.id)
        .eq('item_id', currentSet.votedItemId);

      if (error) throw error;

      // Update the local state to remove the vote
      setComparisonSets(prev => 
        prev.map((set, i) => 
          i === currentIndex ? { ...set, hasVoted: false, votedItemId: null, ...updateSetVotes(set, currentSet.votedItemId, false) } : set
        )
      );

      // Log the reset activity
      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.VOTE_REVERT,
        entityType: ENTITY_TYPES.COMPARISON_SET,
        entityId: currentSet.id,
        pageName: `/compare/${currentSet.id}`,
        metadata: { 
          comparisonSetId: currentSet.id,
          resetItemId: currentSet.votedItemId
        }
      });

    } catch (error) {
      console.error('Error resetting vote:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleLikeComparisonSet = async (setId) => {
    if (!user) return;
    // console.log('handleLikeComparisonSet', setId);
    try {
      const currentSet = comparisonSets[currentIndex];
      const newHasLiked = !currentSet.hasLiked;
      
      if (newHasLiked) {
        await supabase
          .from('comparison_set_comment_reactions')
          .insert([{ set_id: setId, user_id: user.id, reaction_type: 'like' }]);

        await userActivityService.logActivity({
          userId: user.id,
          activityType: ACTIVITY_TYPES.LIKE_COMPARISON_SET,
          entityType: ENTITY_TYPES.COMPARISON_SET,
          entityId: setId,
          pageName: `/compare/${setId}`,
          metadata: { 
            comparisonSetId: setId,
            comparisonSetTitle: currentSet.title
          }
        });
      } else {
        await supabase
          .from('comparison_set_comment_reactions')
          .delete()
          .eq('set_id', setId)
          .eq('user_id', user.id);

        await userActivityService.logActivity({
          userId: user.id,
          activityType: ACTIVITY_TYPES.UNLIKE_COMPARISON_SET,
          entityType: ENTITY_TYPES.COMPARISON_SET,
          entityId: setId,
          pageName: `/compare/${setId}`,
          metadata: { 
            comparisonSetId: setId,
            comparisonSetTitle: currentSet.title
          }
        });
      }

      setComparisonSets(prev => 
        prev.map((set, i) => 
          i === currentIndex ? { ...set, hasLiked: newHasLiked, likeCount: newHasLiked ? set.likeCount + 1 : set.likeCount - 1 } : set
        )
      );
    } catch (error) {
      console.error('Error liking comparison set:', error);
    }
  };

  const handleSetCurrentIndex = (newIndex) => {
    if (newIndex >= 0 && newIndex < comparisonSets.length) {
      setCurrentIndex(newIndex);
    }
  };

  return {
    comparisonSets,
    currentIndex,
    setCurrentIndex: handleSetCurrentIndex,
    lastLoadedIndex,
    handleVote,
    handleReset,
    handleLikeComparisonSet
  };
}; 