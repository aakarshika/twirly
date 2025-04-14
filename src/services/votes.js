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
        set:comparison_sets (
          id,
          name,
          category:categories (
            name
          )
        ),
        item:items (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match the UI requirements
    return votes.map(vote => ({
      id: vote.id,
      comparisonSetName: vote.set?.name,
      category: vote.set?.category?.name,
      votedItem: vote.item?.name,
      createdAt: vote.created_at
    }));
  } catch (error) {
    console.error('Error fetching user votes:', error);
    throw error;
  }
}; 