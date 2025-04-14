import { supabase } from '../lib/supabase';
import { TEMP_USER_ID } from '../lib/constants';

/**
 * Get user profile data
 * @returns {Promise<Object>} The user's profile data with activity counts
 */
export const getUserProfile = async () => {
  try {
    // 1. Get the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', TEMP_USER_ID)
      .single();

    if (userError) throw userError;

    // 2. Get the activity summary
    const { data: activitySummary, error: summaryError } = await supabase
      .from('user_activity_summary')
      .select('total_votes, total_reviews, total_products, total_comparisons, total_likes_received')
      .eq('user_id', TEMP_USER_ID)
      .single();

    if (summaryError) throw summaryError;

    // Combine the data
    return {
      ...user,
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
  try {
    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', TEMP_USER_ID)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}; 