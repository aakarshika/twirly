import { supabase } from '../lib/supabase';

/**
 * Get all comments and replies made by a user on comparison sets
 * @param {number} userId - The ID of the user
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Object containing comments, total count, and pagination info
 */
export const getUserComments = async (userId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // Fetch top-level comments
    const { data: comments, error: commentsError, count } = await supabase
      .from('comparison_set_comments')
      .select(`
        *,
        user:user_preferences(*),
        reactions:comparison_set_comment_reactions(reaction_type, user_id),
        replies:comparison_set_comment_replies(*,user:user_preferences(*)),
          comparison_sets(
            *,
            category:categories(name)
          )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (commentsError) throw commentsError;

    return {
      comments: comments.map(comment => ({
        ...comment,
        userReaction: comment.reactions?.find(r => r.user_id === userId)?.reaction_type || null,
        replies: comment.replies || []
      })),
      total: count,
      page,
      limit,
      hasMore: count > offset + limit
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}; 