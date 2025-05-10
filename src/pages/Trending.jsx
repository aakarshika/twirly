import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useComparison } from '../contexts/ComparisonContext';
import { useHeader } from '../contexts/HeaderContext';
import { MessageSquare, TrendingUp, Users } from 'lucide-react';
import { COMPARISON_COLOR_SET } from '../lib/constants';
import { randomPastelColor, splitAndJoin } from '../lib/utils';
import TrendingCard from '../components/common-cards/TrendingCard';

const Trending = () => {
  const [trendingSets, setTrendingSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isHeaderVisible } = useHeader();
  const { setCurrentSet } = useComparison();

  useEffect(() => {
    const fetchTrendingSets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .rpc('fetch_popular_aspect_sets_for_user', { v_user_id: user.id })
          .select(`
            *,
            comparison_set_items (
              items (
                id,
                name,
                image_url,
                item_color_string
              )
            )
          `)
          // .eq('user_id_voted', user.id)
          .limit(20);

        if (error) throw error;
        setTrendingSets(data);
      } catch (err) {
        console.error('Error fetching trending sets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingSets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-2"
      style={{ 
        position: 'relative',
        top: isHeaderVisible ? '64px' : '0px',
        backgroundColor: currentTheme.colors.background
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-8 justify-center">
          <TrendingUp size={24} className="mr-2" style={{ color: currentTheme.colors.primary }} />
          <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
            Trending Comparisons
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingSets.map((set) => {
            return (
            <div key={set.aspect_set_id}>
              <TrendingCard set={set} />
            </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Trending; 