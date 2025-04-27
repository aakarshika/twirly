import { supabase } from '../lib/supabase';

export const comparisonSetService = {
  async fetchComments(setId, userId, page = 1, limit = 3) {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('comparison_set_comments')
      .select(`
        *,
        user:user_preferences(*),
        reactions:comparison_set_comment_reactions(reaction_type, user_id),
        replies:comparison_set_comment_replies(*,user:user_preferences(*))
      `, { count: 'exact' })
      .eq('set_id', setId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      comments: data.map(comment => ({
        ...comment,
        userReaction: comment.reactions?.find(r => r.user_id === userId)?.reaction_type || null,
        replies: comment.replies || []
      })),
      total: count,
      page,
      limit,
      hasMore: count > offset + limit
    };
  },

  async postComment(setId, userId, text) {
    const { data, error } = await supabase
      .from('comparison_set_comments')
      .insert([{ set_id: setId, user_id: userId, text }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleLike(commentId, userId, hasLiked) {
    if (hasLiked) {
      await supabase
        .from('comparison_set_comment_reactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('comparison_set_comment_reactions')
        .insert([{ comment_id: commentId, user_id: userId, reaction_type: 'like' }]);
    }
  },

  async postReply(commentId, userId, text) {
    const { data, error } = await supabase
      .from('comparison_set_comment_replies')
      .insert([{ parent_comment_id: commentId, user_id: userId, text }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserPreferences(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('display_name')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }
}; 