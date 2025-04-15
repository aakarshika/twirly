import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
/**
 * Cast a vote for an item in a comparison set
 * @param {number} itemId - The ID of the item being voted for
 * @param {number} setId - The ID of the comparison set
 * @returns {Promise<Object>} The result of the vote operation
 */

export const castVote = async (setId, itemId) => {
  const { user } = useAuth();
  if (!user) {
    throw new Error('You must be logged in to vote');
  }

  try {
    const { data: existingVote, error: voteError } = await supabase
      .from('votes')
      .select('*')
      .eq('set_id', setId)
      .single();

    if (voteError && voteError.code !== 'PGRST116') {
      throw voteError;
    }

    if (existingVote) {
      // Update existing vote
      const { error: updateError } = await supabase
        .from('votes')
        .update({ item_id: itemId })
        .eq('id', existingVote.id);

      if (updateError) throw updateError;
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from('votes')
        .insert([{ set_id: setId, item_id: itemId }]);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
};

/**
 * Get the vote count for an item in a comparison set
 * @param {number} itemId - The ID of the item
 * @param {number} setId - The ID of the comparison set
 * @returns {Promise<number>} The number of votes for the item
 */
export const getVoteCount = async (setId, itemId) => {
  try {
    const { count, error } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('set_id', setId)
      .eq('item_id', itemId);

    if (error) throw error;
    return count;
  } catch (error) {
    console.error('Error getting vote count:', error);
    throw error;
  }
};

/**
 * Check if a user has voted in a comparison set
 * @param {number} setId - The ID of the comparison set
 * @param {Object} user - The authenticated user object
 * @returns {Promise<boolean>} Whether the user has voted
 */
export const hasUserVoted = async (setId, user) => {
  if (!user) return false;

  try {
    const { data, error } = await supabase
      .from('votes')
      .select('item_id')
      .eq('set_id', setId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.item_id || null;
  } catch (error) {
    console.error('Error checking user vote:', error);
    throw error;
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
