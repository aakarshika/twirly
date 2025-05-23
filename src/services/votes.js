import { supabase } from '../lib/supabase';

/**
 * Get all votes cast by a user with comparison set details
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} Array of votes with comparison set and item details
 */
export const getUserVotes = async (userId) => {
  try {
    const { data: votes, error } = await supabase
      .from('votes')
      .select(`
        id,
        created_at,
        item_id,
        comparison_set_aspects (
          id,
          set_id,
        metric_name,
          comparison_sets (
            id,
            name
          )
        ),
        voted_for:items (
                id,
                name
              )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match the UI requirements
    return votes;
  } catch (error) {
    console.error('Error fetching user votes:', error);
    throw error;
  }
}; 