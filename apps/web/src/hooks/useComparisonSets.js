import { useState, useEffect, useRef } from 'react';
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
    hasLiked: !!s.has_liked,
    likeCount: s.total_likes ?? 0,
    totalVotes,
    end_date: s.end_date,
    created_at: s.created_at,
    set_categories: [],
  };
}

export const useComparisonSets = paramId => {
  const { user, userPreferences } = useAuth();
  const [allCategories, setAllCategories] = useState([]);
  const [comparisonSets, setComparisonSets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [selectedTag, setSelectedTag] = useState('user_home_feed_91819');
  const [categoryId, setCategoryId] = useState(null);
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
  const fetchSetById = async id => {
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

  // Load more when approaching the end — deduplicate to avoid repeat keys
  useEffect(() => {
    if (currentIndex === -1 || !user) return;
    if (currentIndex < comparisonSets.length - 2) return;

    const loadMore = async () => {
      const newSets = await fetchSets(buildFetchParams());
      if (newSets.length === 0) return;
      setComparisonSets(prev => {
        const seen = new Set(prev.map(s => s.id));
        const unique = newSets.filter(s => !seen.has(s.id));
        return unique.length > 0 ? [...prev, ...unique] : prev;
      });
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

  useEffect(() => {
    if (!user) return;

    const fetchCategories = async () => {
      try {
        const [prefResp, popularResp] = await Promise.all([
          apiClient.get('/api/users/me/category-preferences'),
          apiClient.get('/api/categories/popular', { params: { limit: 10 } }),
        ]);

        const userCategoryPreferences = prefResp.data.data ?? [];
        const allImportantCategories = popularResp.data.data ?? [];

        const filtered = allImportantCategories.filter(
          cat => !userCategoryPreferences.some(
            up => up.category_name?.toLowerCase() === cat.name?.toLowerCase(),
          ),
        );

        // Normalize: the two endpoints return different field names
        // (category_id/category_name vs id/name). Map both to { id, name } so
        // downstream consumers see a single shape.
        const seen = new Set();
        const combined = [
          ...userCategoryPreferences.map(item => ({
            ...item,
            id: item.category_id,
            name: item.category_name,
            userCat: true,
          })),
          ...filtered.map(cat => ({ ...cat, userCat: false })),
        ].filter(cat => {
          const key = `${cat.userCat ? 'u' : 'g'}-${cat.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setAllCategories(combined);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, [user]);

  const handleVote = async itemId => {
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
          : set,
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
          : set,
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

  const handleLikeComparisonSet = async setId => {
    if (!user) return;
    const currentSet = comparisonSets[currentIndex];
    const newHasLiked = !currentSet.hasLiked;

    try {
      if (newHasLiked) {
        await apiClient.post(`/api/comparisons/${setId}/like`);
      } else {
        await apiClient.delete(`/api/comparisons/${setId}/like`);
      }

      setComparisonSets(prev => prev.map((set, i) =>
        i === currentIndex
          ? { ...set, hasLiked: newHasLiked, likeCount: newHasLiked ? set.likeCount + 1 : set.likeCount - 1 }
          : set,
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
    setSelectedTag,
    userPreferences,
    allCategories,
  };
};
