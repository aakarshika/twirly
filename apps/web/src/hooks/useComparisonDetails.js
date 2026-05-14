import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useComparison } from '../contexts/useComparison';
import { useAuth } from '../contexts/AuthContext';

export const useComparisonDetails = currentSetId => {
  const {
    setItems,
    setUserVoted,
    setVotedItemId,
    setCurrentComparisonName,
    setCurrentComparisonDescription,
    setCurrentSet,
    items,
    currentSet,
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
        if (isNaN(comparisonId)) throw new Error('Invalid comparison ID');

        const { data: resp } = await apiClient.get(`/api/sets/${comparisonId}`, {
          params: { userId: user.id },
        });
        const data = resp.data;
        if (!data) throw new Error('Comparison not found');

        setCurrentComparisonName(data.set_name ?? data.name);
        setCurrentComparisonDescription(data.description);
        setCurrentSet(data);
        setUserVoted(!!data.has_voted);
        setVotedItemId(data.voted_item_id ?? null);

        const it = Array.isArray(data.items) ? data.items : [];
        setItems(it);
      } catch (err) {
        console.error('Error fetching comparison details:', err);
        setError(err.response?.data?.error?.message ?? err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonDetails();
  }, [currentSetId, user]);

  return { items, currentSet, loading, error };
};
