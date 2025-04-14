import { supabase } from '../lib/supabase';

/**
 * Get all comments and replies made by a user on comparison sets
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} Array of comments and replies with comparison set details
 */
export const getUserComments = async (userId) => {
  try {
    // Fetch top-level comments
    const { data: comments, error: commentsError } = await supabase
      .from('comparison_set_comments')
      .select(`
        id,
        text,
        likes_count,
        dislikes_count,
        replies_count,
        is_edited,
        created_at,
        updated_at,
        set:comparison_sets (
          id,
          name,
          category:categories (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (commentsError) throw commentsError;

    // Fetch replies
    const { data: replies, error: repliesError } = await supabase
      .from('comparison_set_comment_replies')
      .select(`
        id,
        text,
        likes_count,
        dislikes_count,
        is_edited,
        created_at,
        updated_at,
        parent_comment:comparison_set_comments (
          id,
          set:comparison_sets (
            id,
            name,
            category:categories (
              name
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (repliesError) throw repliesError;

    // Transform comments data
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      type: 'comment',
      text: comment.text,
      likes: comment.likes_count,
      dislikes: comment.dislikes_count,
      replies: comment.replies_count,
      isEdited: comment.is_edited,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      comparisonSetName: comment.set.name,
      category: comment.set.category.name
    }));

    // Transform replies data
    const transformedReplies = replies.map(reply => ({
      id: reply.id,
      type: 'reply',
      text: reply.text,
      likes: reply.likes_count,
      dislikes: reply.dislikes_count,
      isEdited: reply.is_edited,
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
      comparisonSetName: reply.parent_comment.set.name,
      category: reply.parent_comment.set.category.name,
      parentCommentId: reply.parent_comment.id
    }));

    // Combine and sort by creation date
    return [...transformedComments, ...transformedReplies]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error fetching user comments:', error);
    throw error;
  }
}; 