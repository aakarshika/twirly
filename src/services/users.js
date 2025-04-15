import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Get user profile data
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The user's profile data with activity counts
 */
export const getUserProfile = async (userId) => {
  try {
    // 1. Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // 2. Get the activity summary
    const { data: activitySummary, error: summaryError } = await supabase
      .from('user_activity_summary')
      .select('total_votes, total_reviews, total_products, total_comparisons, total_likes_received')
      .eq('user_id', userId)
      .single();

    if (summaryError) throw summaryError;

    // Combine the data
    return {
      ...profile,
      votes_count: activitySummary.total_votes,
      reviews_count: activitySummary.total_reviews,
      products_count: activitySummary.total_products,
      comparisons_count: activitySummary.total_comparisons,
      likes_count: activitySummary.total_likes_received
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile data
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<Object>} The updated user profile
 */
export const updateUserProfile = async (profileData) => {
  const { user } = useAuth();

  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}; 