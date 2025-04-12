import { supabase } from '../lib/supabase';

/**
 * Get all polls created by a user with vote counts
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} Array of polls with vote counts
 */
export const getUserPolls = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('comparison_sets')
      .select(`
        id,
        name,
        created_at,
        categories (
          name
        ),
        votes (
          id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(poll => ({
      id: poll.id,
      title: poll.name,
      votes: poll.votes.length,
      date: poll.created_at,
      status: 'active', // TODO: Add status field to comparison_sets table
      category: poll.categories?.name || 'Uncategorized'
    }));
  } catch (error) {
    console.error('Error fetching user polls:', error);
    throw error;
  }
}; 