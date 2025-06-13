import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

const TrendingContext = createContext();

export const useTrending = () => {
  const context = useContext(TrendingContext);
  if (!context) {
    throw new Error('useTrending must be used within a TrendingProvider');
  }
  return context;
};

export const TrendingProvider = ({ children }) => {
  const [trendingSets, setTrendingSets] = useState([]);
  const [myFeedSets, setMyFeedSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const location = useLocation();

  const fetchTrendingSets = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('fetch_popular_aspect_sets_for_user', { v_user_id: user.id })
        .select(`
          *,
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

  const fetchMyFeedSets  = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_filtered_sets', {
          _user_id: user?.id,
          _filter_type: 'home',
          _category_id: null,
          _category_ids: null,
          _limit: 2
        });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      setMyFeedSets(data);
    } catch (err) {
      console.error('Error fetching filtered sets:', err);
    }
  };

  const value = {
    trendingSets,
    user,
    loading,
    error,
    fetchTrendingSets,
    fetchMyFeedSets,
    myFeedSets
  };

  return (
    <TrendingContext.Provider value={value}>
      {children}
    </TrendingContext.Provider>
  );
}; 