import { supabase } from '../lib/supabase';
import { TEMP_USER_ID } from '../lib/constants';
/**
 * Cast a vote for an item in a comparison set
 * @param {number} itemId - The ID of the item being voted for
 * @param {number} setId - The ID of the comparison set
 * @returns {Promise<Object>} The result of the vote operation
 */

export const castVote = async (itemId, setId) => {
  try {
    console.log('Attempting to cast vote:', { itemId, setId });
    
    // For now, we'll use a temporary user ID

    // First check if user has already voted in this set
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', TEMP_USER_ID)
      .eq('set_id', setId)
      .maybeSingle();

    console.log('Existing vote check result:', { existingVote, checkError });

    if (checkError) {
      console.error('Error checking existing vote:', checkError);
      throw checkError;
    }

    if (existingVote) {
      console.log('User has already voted in this set');
      throw new Error('User has already voted in this comparison set');
    }

    // Insert the new vote
    const { data, error } = await supabase
      .from('votes')
      .insert([
        {
          user_id: TEMP_USER_ID,
          item_id: itemId,
          set_id: setId
        }
      ])
      .select()
      .single();

    console.log('Vote insert result:', { data, error });

    if (error) {
      console.error('Error casting vote:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in castVote:', error);
    throw error;
  }
};

/**
 * Get the vote count for an item in a comparison set
 * @param {number} itemId - The ID of the item
 * @param {number} setId - The ID of the comparison set
 * @returns {Promise<number>} The number of votes for the item
 */
export const getVoteCount = async (itemId, setId) => {
  try {
    const { count, error } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', itemId)
      .eq('set_id', setId);

    if (error) {
      console.error('Error getting vote count:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getVoteCount:', error);
    return 0;
  }
};

/**
 * Check if a user has voted in a comparison set
 * @param {number} setId - The ID of the comparison set
 * @returns {Promise<boolean>} Whether the user has voted
 */
export const hasUserVoted = async (setId) => {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', TEMP_USER_ID)
      .eq('set_id', setId)
      .maybeSingle();

    if (error) {
      console.error('Error checking user vote:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in hasUserVoted:', error);
    return false;
  }
};

/**
 * Get all votes cast by a user with comparison set and item details
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} Array of votes with comparison set and item details
 */
export const getUserVotes = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select(`
        id,
        created_at,
        set_id,
        item_id,
        comparison_sets (
          id,
          name,
          categories (
            name
          )
        ),
        items (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(vote => ({
      id: vote.id,
      title: vote.comparison_sets.name,
      votedFor: vote.items.name,
      date: vote.created_at,
      category: vote.comparison_sets.categories?.name || 'Uncategorized'
    }));
  } catch (error) {
    console.error('Error fetching user votes:', error);
    throw error;
  }
};
