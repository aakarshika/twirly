import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';

const BATCH_SIZE = 5;
const MAX_CACHED_SETS = 20; // Maximum number of sets to keep in memory

export const useComparisonSets = (paramId) => {
  const { user, userPreferences } = useAuth();
  const [userCategoryPreferences, setUserCategoryPreferences] = useState([]);
  const [allImportantCategories, setAllImportantCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [comparisonSets, setComparisonSets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [selectedTag, setSelectedTag] = useState('home');
  const [categoryId, setCategoryId] = useState(null);
  const [categoryIds, setCategoryIds] = useState(null);
  const isInitialLoad = useRef(true);

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
        .select(`
          *,
          comparison_set_items!inner(items(*)),
          user_preferences(*),
          votes(item_id),
          comparison_set_comment_reactions(count)
        `)
        .eq('id', setId)
        .single();
      
      if (data) {
        // Get total votes for all items
        const totalVotes = data.votes?.length || 0;
        
        // Check if current user has voted
        let hasVoted = false;
        let votedItemId = null;
        try{if (user) {
          const { data: userVote } = await supabase
            .from('votes')
            .select('item_id')
            .eq('set_id', setId)
            .eq('user_id', user.id)
            .select();

          hasVoted = userVote.length > 0;
          votedItemId = userVote.length > 0 ? userVote[0].item_id : null;
        }}
        catch (err) {
          // console.error('Error fetching user vote:', err);
        }

        // Check if user has liked
        let hasLiked = false;
        try{if (user) {
          const { data: userLike } = await supabase
            .from('comparison_set_comment_reactions')
            .select('*')
            .eq('set_id', setId)
            .eq('user_id', user.id)
            .select();
          hasLiked = userLike.length > 0;
        }}
        catch (err) {
          // console.error('Error fetching user like:', err);
        }

        var winningItemId = data.comparison_set_items[0].items.id;
        // console.log('✅ Successfully fetched set:', setId);
        const set =  {
          ...data,
          user_name: data.user_preferences.display_name,
          user_profile_image_url: data.user_preferences.profile_image_url,
          set_items: data.comparison_set_items.map(item => 
            {
              const votes = data.votes.filter(vote => vote.item_id === item.items.id).length;
              const votesPercentage = (votes / totalVotes) * 100;
              if (votesPercentage > winningItemId.votesPercentage) {
                winningItemId = item.items.id;
              }
              return ({
            ...item.items,
            votes: votes,
            votesPercentage: votesPercentage
          })}),
          hasVoted,
          votedItemId,
          hasLiked,
          likeCount: data.comparison_set_comment_reactions?.length  > 0 ? data.comparison_set_comment_reactions[0].count  : 0,
          totalVotes
        };
        set.set_items.forEach(item => {
          item.winner = item.id === winningItemId;
        });
        return set;
      }
      // console.log('❌ No data found for set:', setId);
      return null;
    } catch (err) {
      console.error('❌ Error fetching set:', setId, err);
      return null;
    }
  };

  const fetchFilteredSets = async () => {
    let filterType = null;

    if (selectedTag) {
      if (selectedTag === 'trending') {
        filterType = 'trending';
      } else if (selectedTag === 'home') {
        filterType = 'home';
      } else if (selectedTag === 'controversial') {
        filterType = 'controversial';
      } else if (selectedTag === 'new') {
        filterType = 'new';
      } else {
        filterType = 'single_category';
      }
    }
    try {
      const { data, error } = await supabase
        .rpc('get_filtered_sets', {
          _user_id: user?.id,
          _filter_type: filterType,
          _category_id: categoryId,
          _category_ids: null,
          _limit: BATCH_SIZE
        })
        .select(`
            *
        `);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch full details for each set
      const setDetailsPromises = data.map(set => fetchSetDetails(set.set_id));
      const setDetails = await Promise.all(setDetailsPromises);
      

      return setDetails.filter(Boolean);
      // return data;
    } catch (err) {
      console.error('Error fetching filtered sets:', err);
      return [];
    }
  };
  useEffect(() => {
    console.log('🔍 comparisonSets', comparisonSets);
  }, [comparisonSets]);

  // Effect for initial load
  useEffect(() => {
    if (!user || !isInitialLoad.current) return;

    const loadInitialData = async () => {
      try {
        const initialSets = [];
        
        // If we have a paramId, load that set first
        if (paramId) {
          const initialSet = await fetchSetDetails(paramId);
          if (initialSet) {
            initialSets.push(initialSet);
          }
        }

        // Load the first batch of sets
        const firstBatch = await fetchFilteredSets();
        if (firstBatch.length > 0) {
          initialSets.push(...firstBatch.filter(set => set.id !== paramId));
        }

        if (initialSets.length > 0) {
          setComparisonSets(initialSets);
          setCurrentIndex(0);
        }

        isInitialLoad.current = false;
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    loadInitialData();
  }, [user, paramId]);

  // Effect for loading more sets when reaching the end
  useEffect(() => {
    if (currentIndex === -1 || !user) return;

    const loadNextBatch = async () => {
      if (currentIndex >= comparisonSets.length - 2) {
        const newSets = await fetchFilteredSets();
        if (newSets.length > 0) {
          setComparisonSets(prev => [...prev, ...newSets]);
        }
      }
    };

    loadNextBatch();
  }, [currentIndex, user]);

  // Effect for handling tag changes
  useEffect(() => {
    if (!user || isInitialLoad.current) return;

    const loadTaggedBatch = async () => {
      const sets = await fetchFilteredSets();
      if (sets.length > 0) {
        setComparisonSets(sets);
        setCurrentIndex(0);
      } else {
        setComparisonSets([]);
        setCurrentIndex(-1);
      }
    };

    loadTaggedBatch();
  }, [selectedTag, user]);

  // Effect for fetching categories
  useEffect(() => {
    if (!user) return;
    
    const fetchCategories = async () => {
      const { data: userCategoryPreferences } = await supabase
        .from('user_category_preferences')
        .select('*, categories(*)')
        .eq('user_id', user?.id);
      
      const { data: allImportantCategories } = await supabase
        .from('categories')
        .select('*, set_categories!inner(*)')
        .order('id', { ascending: true })
        .limit(5);

      setUserCategoryPreferences(userCategoryPreferences);
      const allImportantCategoriesFiltered = allImportantCategories.filter(
        category => !userCategoryPreferences.some(item => item.categories.name === category.name)
      );
      setAllImportantCategories(allImportantCategoriesFiltered);
      setAllCategories([ ...userCategoryPreferences.map(item => item.categories), ...allImportantCategoriesFiltered]);
    };

    fetchCategories();
  }, [user]);

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


  return {
    comparisonSets,
    currentIndex,
    setCurrentIndex,
    handleVote,
    handleReset,
    handleLikeComparisonSet,
    setCategoryId,
    setCategoryIds,
    setSelectedTag,
    userPreferences,
    allCategories
  };
}; 