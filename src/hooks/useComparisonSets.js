import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../services/userActivityService';

const BATCH_SIZE = 5;

/**
 * Transform a set row from /api/sets into the shape the compare UI expects.
 * Per-item votes are included in the items array from the backend.
 */
function transformSet(s) {
  const totalVotes = s.total_votes ?? 0;
  const rawItems = Array.isArray(s.items) ? s.items : [];
  const maxVotes = rawItems.reduce((m, i) => Math.max(m, i.votes ?? 0), 0);

  const set_items = rawItems.map(item => ({
    ...item,
    votes: item.votes ?? 0,
    votesPercentage: totalVotes > 0 ? ((item.votes ?? 0) / totalVotes) * 100 : 0,
    winner: (item.votes ?? 0) === maxVotes && maxVotes > 0,
  }));

  return {
    id: s.set_id,
    name: s.set_name,
    user_name: s.creator_display_name,
    user_profile_image_url: s.creator_image_url,
    set_items,
    hasVoted: !!s.has_voted,
    votedItemId: s.voted_item_id ?? null,
    voteId: s.vote_id ?? null,
    hasLiked: false,  // Sprint 8: comparison_set_comment_reactions not yet migrated
    likeCount: 0,
    totalVotes,
    end_date: s.end_date,
    created_at: s.created_at,
    set_categories: [],
  };
}

export const useComparisonSets = (paramId) => {
  const { user, userPreferences } = useAuth();
  const [allCategories, setAllCategories] = useState([]);
  const [comparisonSets, setComparisonSets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [selectedTag, setSelectedTag] = useState('user_home_feed_91819');
  const [categoryId, setCategoryId] = useState(null);
  const [categoryIds, setCategoryIds] = useState(null);
  const isInitialLoad = useRef(true);

  const getPercentAndWinner = (items, totalVotes) => {
    items.forEach(opt => { opt.votesPercentage = opt.votes / totalVotes * 100; });
    const winner = items.reduce((max, opt) => opt.votesPercentage > max.votesPercentage ? opt : max);
    items.forEach(opt => { opt.winner = opt.name === winner.name; });
    return items;
  };

  /** Fetch a batch of sets from the backend, transformed to UI shape. */
  const fetchSets = async ({ userId, catId, excludeVoted, limit = BATCH_SIZE }) => {
    try {
      const { data } = await apiClient.get('/api/sets', {
        params: {
          userId: userId || undefined,
          categoryId: catId || undefined,
          excludeVoted: excludeVoted ? 'true' : undefined,
          limit,
        },
      });
      return (data.data ?? []).map(transformSet);
    } catch (err) {
      console.error('Error fetching sets:', err);
      return [];
    }
  };

  /** Fetch a single set by id (for initial URL-based navigation). */
  const fetchSetById = async (id) => {
    try {
      const { data } = await apiClient.get(`/api/sets/${id}`, {
        params: { userId: user?.id || undefined },
      });
      return data.data ? transformSet(data.data) : null;
    } catch (err) {
      console.error('Error fetching set by id:', err);
      return null;
    }
  };

  /** Determine fetch params based on the active tag / category state. */
  const buildFetchParams = () => {
    const base = { userId: user?.id, limit: BATCH_SIZE };
    if (selectedTag === 'user_home_feed_91819') return { ...base, excludeVoted: true };
    if (selectedTag === 'trending') return base;
    if (categoryId) return { ...base, catId: categoryId };
    return base;
  };

  const updateSetVotes = (set, votedItemId, isAdding) => {
    const updatedItems = set.set_items.map(item => ({
      ...item,
      votes: isAdding && item.id === votedItemId ? item.votes + 1 : item.votes,
    }));
    const totalVotes = updatedItems.reduce((acc, item) => acc + item.votes, 0);
    return { set_items: getPercentAndWinner(updatedItems, totalVotes), totalVotes };
  };

  // Initial load
  useEffect(() => {
    if (!user || !isInitialLoad.current) return;

    const load = async () => {
      try {
        const initialSets = [];

        if (paramId) {
          const initial = await fetchSetById(paramId);
          if (initial) initialSets.push(initial);
        }

        const batch = await fetchSets(buildFetchParams());
        initialSets.push(...batch.filter(s => s.id !== paramId));

        if (initialSets.length > 0) {
          setComparisonSets(initialSets);
          setCurrentIndex(0);
        }
        isInitialLoad.current = false;
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    load();
  }, [user, paramId]);

  // Load more when approaching the end
  useEffect(() => {
    if (currentIndex === -1 || !user) return;
    if (currentIndex < comparisonSets.length - 2) return;

    const loadMore = async () => {
      const newSets = await fetchSets(buildFetchParams());
      if (newSets.length > 0) setComparisonSets(prev => [...prev, ...newSets]);
    };
    loadMore();
  }, [currentIndex, user]);

  // Reload when tag / category changes
  useEffect(() => {
    if (!user || isInitialLoad.current) return;

    const reload = async () => {
      const sets = await fetchSets(buildFetchParams());
      setComparisonSets(sets);
      setCurrentIndex(sets.length > 0 ? 0 : -1);
    };
    reload();
  }, [selectedTag, user]);

  // Category fetch — still uses Supabase (Sprint 12 will migrate user/preference endpoints)
  useEffect(() => {
    if (!user) return;

    const fetchCategories = async () => {
      const { data: userCategoryPreferences } = await supabase
        .from('user_category_preferences')
        .select('*, categories(*)')
        .eq('user_id', user?.id);

      const { data: allImportantCategories } = await supabase
        .from('top_category_groups')
        .select('*')
        .order('set_count', { ascending: false })
        .limit(10);

      const filtered = (allImportantCategories ?? []).filter(
        cat => !(userCategoryPreferences ?? []).some(
          up => up.categories?.name?.toLowerCase() === cat.category_group?.toLowerCase()
        )
      );
      setAllCategories([
        ...(userCategoryPreferences ?? []).map(item => ({ ...item.categories, userCat: true })),
        ...filtered.map(cat => ({
          ...cat, name: cat.category_group,
          included_categories: cat.included_categories, userCat: false,
        })),
      ]);
    };

    fetchCategories();
  }, [user]);

  const handleVote = async (itemId) => {
    if (!user || !comparisonSets[currentIndex]) return;
    const currentSet = comparisonSets[currentIndex];
    if (currentSet.hasVoted) return;

    try {
      const { data: resp } = await apiClient.post('/api/votes', {
        setId: currentSet.id, itemId,
      });
      const voteId = resp.data?.id ?? null;

      setComparisonSets(prev => prev.map((set, i) =>
        i === currentIndex
          ? { ...set, hasVoted: true, votedItemId: itemId, voteId, ...updateSetVotes(set, itemId, true) }
          : set
      ));

      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.VOTE,
        entityType: ENTITY_TYPES.COMPARISON_SET,
        entityId: currentSet.id,
        pageName: `/compare/${currentSet.id}`,
        metadata: { comparisonSetId: currentSet.id, votedItemId: itemId },
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleReset = async () => {
    if (!user || !comparisonSets[currentIndex]) return;
    const currentSet = comparisonSets[currentIndex];
    if (!currentSet.hasVoted || !currentSet.votedItemId) return;

    try {
      if (currentSet.voteId) {
        await apiClient.delete(`/api/votes/${currentSet.voteId}`);
      } else {
        await apiClient.delete('/api/votes', { params: { setId: currentSet.id } });
      }

      setComparisonSets(prev => prev.map((set, i) =>
        i === currentIndex
          ? { ...set, hasVoted: false, votedItemId: null, voteId: null,
              ...updateSetVotes(set, currentSet.votedItemId, false) }
          : set
      ));

      await userActivityService.logActivity({
        userId: user.id,
        activityType: ACTIVITY_TYPES.VOTE_REVERT,
        entityType: ENTITY_TYPES.COMPARISON_SET,
        entityId: currentSet.id,
        pageName: `/compare/${currentSet.id}`,
        metadata: { comparisonSetId: currentSet.id, resetItemId: currentSet.votedItemId },
      });
    } catch (error) {
      console.error('Error resetting vote:', error);
    }
  };

  // Sprint 8 carry-over: comparison_set_comment_reactions not yet in backend schema.
  // handleLikeComparisonSet stays on Supabase until Sprint 8 migrates comments/reactions.
  const handleLikeComparisonSet = async (setId) => {
    if (!user) return;
    try {
      const currentSet = comparisonSets[currentIndex];
      const newHasLiked = !currentSet.hasLiked;

      if (newHasLiked) {
        await supabase
          .from('comparison_set_comment_reactions')
          .insert([{ set_id: setId, user_id: user.id, reaction_type: 'like' }]);
      } else {
        await supabase
          .from('comparison_set_comment_reactions')
          .delete()
          .eq('set_id', setId)
          .eq('user_id', user.id);
      }

      setComparisonSets(prev => prev.map((set, i) =>
        i === currentIndex
          ? { ...set, hasLiked: newHasLiked, likeCount: newHasLiked ? set.likeCount + 1 : set.likeCount - 1 }
          : set
      ));
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
    allCategories,
  };
};
