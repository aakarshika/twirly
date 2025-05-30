import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useComparison } from '../contexts/useComparison';
import { getVoteCount, hasUserVoted } from '../services/voting';
import { getItemReviews, getItemAverageMetrics } from '../services/reviews';
import { useAuth } from '../contexts/AuthContext';

export const useComparisonDetails = (currentSetId) => {
  const { 
    setItems, 
    setUserVoted, 
    setVotedItemId,
    setCurrentComparisonName,
    setCurrentComparisonDescription,
    setCurrentSet,
    items,
    currentSet
  } = useComparison(currentSetId);
  
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisonDetails = async () => {
      if (!currentSetId || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const comparisonId = parseInt(currentSetId);
        if (isNaN(comparisonId)) {
          throw new Error('Invalid comparison ID');
        }
        
        const { data, error } = await supabase
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
            )
          `)
          .eq('id', comparisonId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Comparison not found');

        setCurrentComparisonName(data.name);
        setCurrentComparisonDescription(data.description);
        setCurrentSet(data);

        // Check if user has voted in this set
        const hasVoted = await hasUserVoted(data.id, user);
        setUserVoted(hasVoted);
        
        const it = data.comparison_set_items?.map(setItem => setItem.items) || [];
        setItems(it);
      } catch (error) {
        console.error('Error fetching comparison details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonDetails();
  }, [currentSetId, user]);

  return { items, currentSet, loading, error };
}; 