import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../lib/apiClient';
import TrendingCard from '../../components/common/common-cards/TrendingCard';

const ITEMS_PER_PAGE = 5;

const ExploreSimilar = ({ currentSetId }) => {
  const { currentTheme } = useTheme();
  const [similarSets, setSimilarSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchSimilarSets = async () => {
      if (!currentSetId) return;

      try {
        setLoading(true);
        const { data: resp } = await apiClient.get(`/api/sets/${currentSetId}/similar`, {
          params: { limit: ITEMS_PER_PAGE, offset: (page - 1) * ITEMS_PER_PAGE },
        });
        const data = resp.data ?? [];
        setSimilarSets(prev => [...prev, ...data]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching similar sets:', err);
        setError(err.response?.data?.error?.message ?? err.message);
        setLoading(false);
      }
    };

    fetchSimilarSets();
  }, [page]);

  if (loading && similarSets.length === 0) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2"
             style={{ borderColor: currentTheme.colors.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-4">{error}</p>
      </div>
    );
  }

  if (similarSets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {similarSets.map(set => (
        <div
          key={`similar-set-${set.set_id}`}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          <TrendingCard set={set} />
        </div>
      ))}
      {similarSets.length >= ITEMS_PER_PAGE && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="px-4 py-2 rounded-full font-semibold transition-all duration-200 hover:scale-105"
            style={{
              color: currentTheme.colors.text,
            }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreSimilar;
