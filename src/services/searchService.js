import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const searchService = {

  // Search all types
  searchAll: async (query) => {
    try {
      const [sets, items, users] = await Promise.all([
        searchService.searchSets(query),
        searchService.searchItems(query),
        searchService.searchUsers(query)
      ]);
      return { sets, items, users };
    } catch (error) {
      console.error('Error in searchAll:', error);
      throw error;
    }
  },

  // Search comparison sets
  searchSets: async (query) => {

    try {
      const { data, error } = await supabase
        .from('popular_comparison_sets')
        .select('*, comparison_set_items(items(*))')
        .ilike('name', `%${query}%`)
        .order('popularity_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in searchSets:', error);
      throw error;
    }
  },

  // Search items
  searchItems: async (query) => {
    try {
      const { data, error } = await supabase
        .from('searchable_items')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('avg_likes', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in searchItems:', error);
      throw error;
    }
  },

  // Search users
  searchUsers: async (query) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('user_id, username, display_name, profile_image_url')
        .ilike('display_name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  }
}; 