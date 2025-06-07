import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const BATCH_SIZE = 5;

export const useComparisonSets = (initialId) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastLoadedIndex, setLastLoadedIndex] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const loadedVotes = useRef(new Set());
  const loadedBatches = useRef(new Set());
  const isPreloading = useRef(false);
  const isInitialLoad = useRef(true);

  const getPercentAndWinner = (items, totalVotes) => {
    items.forEach(opt => {
      opt.votesPercentage = opt.votes / totalVotes * 100;
    });
    const winner = items.reduce((max, opt) => opt.votesPercentage > max.votesPercentage ? opt : max);
    items.forEach(opt => {
      opt.winner = opt.name === winner.name;
    });
    return items;
  };

  const fetchSetDetails = async (setId) => {
    try {
      const { data, error } = await supabase
        .from('comparison_sets')
        .select('*, comparison_set_items!inner(items(*)), user_preferences(*)')
        .eq('id', setId)
        .single();
      
      if (data) {
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
          totalVotes: 0
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching set:', err);
      return null;
    }
  };

  const fetchVotes = async (setId, setItems) => {
    try {
      const votesPromises = setItems.map(async (item) => {
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact' })
          .eq('set_id', setId)
          .eq('item_id', item.id);
        return { ...item, votes: count || 0 };
      });

      const itemsWithVotes = await Promise.all(votesPromises);
      const totalVotes = itemsWithVotes.reduce((acc, item) => acc + item.votes, 0) || 0;

      // Check if current user has voted
      if (user) {
        const { data: userVote } = await supabase
          .from('votes')
          .select('item_id')
          .eq('set_id', setId)
          .eq('user_id', user.id)
          .single();

        setHasVoted(!!userVote);
        setSelectedItemId(userVote?.item_id || null);
      }

      return {
        set_items: getPercentAndWinner(itemsWithVotes, totalVotes),
        totalVotes
      };
    } catch (err) {
      console.error('Error fetching votes:', err);
      return null;
    }
  };

  const handleVote = async (itemId) => {
    if (!user || !items[currentIndex] || hasVoted) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          item_id: itemId,
          set_id: items[currentIndex].id
        })
        .select();

      if (error) throw error;

      setHasVoted(true);
      setSelectedItemId(itemId);

      // Update local state
      const updatedItems = [...items];
      const currentSet = updatedItems[currentIndex];
      const updatedSetItems = currentSet.set_items.map(item => ({
        ...item,
        votes: item.id === itemId ? item.votes + 1 : item.votes
      }));
      currentSet.set_items = getPercentAndWinner(updatedSetItems, currentSet.totalVotes + 1);
      currentSet.totalVotes = (currentSet.totalVotes || 0) + 1;
      updatedItems[currentIndex] = currentSet;
      setItems(updatedItems);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleReset = async () => {
    if (!user || !items[currentIndex] || !hasVoted) return;

    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('set_id', items[currentIndex].id)
        .eq('item_id', selectedItemId);

      if (error) throw error;

      setHasVoted(false);
      setSelectedItemId(null);

      // Update local state
      const updatedItems = [...items];
      const currentSet = updatedItems[currentIndex];
      const updatedSetItems = currentSet.set_items.map(item => ({
        ...item,
        votes: item.id === selectedItemId ? item.votes - 1 : item.votes
      }));
      currentSet.set_items = getPercentAndWinner(updatedSetItems, currentSet.totalVotes - 1);
      currentSet.totalVotes = (currentSet.totalVotes || 0) - 1;
      updatedItems[currentIndex] = currentSet;
      setItems(updatedItems);
    } catch (error) {
      console.error('Error resetting vote:', error);
    }
  };

  const preloadNextBatch = async () => {
    if (isPreloading.current) return;
    
    const nextBatchStart = lastLoadedIndex + 1;
    if (loadedBatches.current.has(nextBatchStart)) return;

    try {
      isPreloading.current = true;
      const fetchPromises = Array.from({ length: BATCH_SIZE }, (_, i) => 
        fetchSetDetails(nextBatchStart + i)
      );
      
      const newItems = (await Promise.all(fetchPromises)).filter(Boolean);
      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
        setLastLoadedIndex(nextBatchStart + newItems.length - 1);
        loadedBatches.current.add(nextBatchStart);
      }
    } finally {
      isPreloading.current = false;
    }
  };

  // Initial load
  useEffect(() => {
    if (!initialId) return; // Don't load if no ID is provided

    const startId = initialId;
    const fetchPromises = Array.from({ length: BATCH_SIZE }, (_, i) => 
      fetchSetDetails(startId + i)
    );
    
    Promise.all(fetchPromises).then(initialItems => {
      const validItems = initialItems.filter(Boolean);
      if (validItems.length > 0) {
        setItems(validItems);
        setLastLoadedIndex(startId + validItems.length - 1);
        
        // Find the index of the requested set in the loaded items
        const targetIndex = validItems.findIndex(item => item.id === initialId);
        if (targetIndex !== -1) {
          setCurrentIndex(targetIndex);
        }
        
        loadedBatches.current.add(startId);
      }
    });
  }, [initialId]);

  // Load votes for current set
  useEffect(() => {
    const loadVotes = async () => {
      if (items[currentIndex]) {
        const currentSet = items[currentIndex];
        if (!loadedVotes.current.has(currentSet.id)) {
          const votesData = await fetchVotes(currentSet.id, currentSet.set_items);
          if (votesData) {
            setItems(prev => prev.map((item, index) => 
              index === currentIndex 
                ? { ...item, ...votesData }
                : item
            ));
            loadedVotes.current.add(currentSet.id);
          }
        }
      }
    };

    loadVotes();
  }, [currentIndex, items]);

  // Preload next batch when approaching the end
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (currentIndex >= items.length - 2 && !isPreloading.current) {
      preloadNextBatch();
    }
  }, [currentIndex, items.length]);

  const handleSetCurrentIndex = (newIndex) => {
    if (newIndex >= 0 && newIndex < items.length) {
      setCurrentIndex(newIndex);
    }
  };

  return {
    items,
    currentIndex,
    setCurrentIndex: handleSetCurrentIndex,
    lastLoadedIndex,
    hasVoted,
    selectedItemId,
    handleVote,
    handleReset
  };
}; 