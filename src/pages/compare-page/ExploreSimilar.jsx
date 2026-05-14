import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
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
        const { data, error } = await supabase
          .rpc('fetch_similar_sets', {
            p_source_set_id: currentSetId,
            p_limit: ITEMS_PER_PAGE,
            p_offset: (page - 1) * ITEMS_PER_PAGE
          });

        if (error) throw error;

        // Fetch additional data for each set
        const setsWithDetails = await Promise.all(
          (data || []).map(async (set) => {
            const { data: setDetails } = await supabase
              .from('comparison_sets')
              .select(`
                comparison_set_aspects (
                  metric_name
                ),
                user:user_preferences(*),
                comparison_set_items (
                  items (
                    id,
                    name,
                    image_url,
                    item_color_string
                  )
                )
              `)
              .eq('id', set.set_id)
              .single();

            return {
              ...set,
              ...setDetails
            };
          })
        );

        setSimilarSets(prev => [...prev, ...setsWithDetails]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching similar sets:', err);
        setError(err.message);
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
      {similarSets.map((set) => (
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
              color: currentTheme.colors.text
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