import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useComparison } from '../contexts/ComparisonContext';
import { getVoteCount, hasUserVoted } from '../services/voting';
import { getItemReviews, getItemAverageMetrics } from '../services/reviews';
import { useAuth } from '../contexts/AuthContext';

export const useComparisonDetails = (id) => {
  const { 
    setItems, 
    setUserVoted, 
    setVotedItemId,
    setCurrentSetId, 
    setCurrentComparisonName,
    setCurrentComparisonDescription,
    setCurrentSet
  } = useComparison();
  
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComparisonDetails = async () => {
      try {
        setLoading(true);
        
        const comparisonId = parseInt(id);
        if (isNaN(comparisonId)) {
          throw new Error('Invalid comparison ID');
        }
        
        const defaultMetrics = {
          quality: 3.5,
          value: 3.5,
          design: 3.5,
          performance: 3.5
        };
        
        const { data, error } = await supabase
          .from('comparison_sets')
          .select(`
            id,
            name,
            description,
            category_id,
            created_at,
            categories(name),
            comparison_set_items(
              id, 
              item_id,
              set_id,
              items(
                id,
                name,
                description,
                image_url
              )
            )
          `)
          .eq('id', comparisonId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Comparison not found');

        setCurrentSetId(data.id);
        setCurrentComparisonName(data.name);
        setCurrentComparisonDescription(data.description);
        setCurrentSet(data);

        // Check if user has voted in this set
        const hasVoted = await hasUserVoted(data.id, user);
        setUserVoted(hasVoted);
        
        if (hasVoted && user) {
          const { data: voteData, error: voteError } = await supabase
            .from('votes')
            .select('item_id')
            .eq('user_id', user.id)
            .single();

          if (!voteError && voteData) {
            setVotedItemId(voteData.item_id);
          }
        } else {
          setVotedItemId(null);
        }

        const voteCounts = await Promise.all(data.comparison_set_items?.map(async setItem => {
          const { count, error } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('item_id', setItem.items.id);

          if (error) {
            console.error('Error getting vote count:', error);
            return {
              itemId: setItem.items.id,
              count: 0
            };
          }

          return {
            itemId: setItem.items.id,
            count: count || 0
          };
        }) || []);

        const items = await Promise.all(data.comparison_set_items?.map(async setItem => {
          try {
            const voteCount = voteCounts.find(vc => vc.itemId === setItem.items.id)?.count || 0;
            const reviews = await getItemReviews(setItem.items.id);
            const averageMetrics = await getItemAverageMetrics(setItem.items.id);
            
            return {
              id: setItem.items.id,
              name: setItem.items.name,
              description: setItem.items.description,
              image: setItem.items.image_url,
              category: data.categories?.name || 'Uncategorized',
              votes: voteCount,
              reviews: reviews.reviews.map(review => ({
                id: review.id,
                text: review.text,
                likes: review.likes,
                timestamp: review.created_at,
                username: review.username || ''
              })),
              averageMetrics: averageMetrics || defaultMetrics
            };
          } catch (err) {
            console.error('Error fetching data for item:', err);
            return {
              id: setItem.items.id,
              name: setItem.items.name,
              description: setItem.items.description,
              image: setItem.items.image_url,
              category: data.categories?.name || 'Uncategorized',
              votes: voteCounts.find(vc => vc.itemId === setItem.items.id)?.count || 0,
              reviews: [],
              averageMetrics: defaultMetrics
            };
          }
        }) || []);

        setItems(items);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching comparison details:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchComparisonDetails();
    }
  }, [id, setItems, setUserVoted, setVotedItemId, setCurrentSetId, setCurrentComparisonName, setCurrentComparisonDescription, setCurrentSet]);

  return { loading, error };
}; 