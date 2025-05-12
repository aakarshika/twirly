import { supabase } from '../lib/supabaseClient';

export const karmaService = {
  /**
   * Get karma points for a specific user
   * @param {string} userId - The UUID of the user
   * @returns {Promise<number>} The total karma points
   */
  async getUserKarmaPoints(userId) {
    try {
      const { data, error } = await supabase
        .from('karma_points')
        .select('total_karma_points')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data?.total_karma_points || 0;
    } catch (error) {
      console.error('Error fetching karma points:', error);
      return 0;
    }
  },

  /**
   * Get karma points for multiple users
   * @param {string[]} userIds - Array of user UUIDs
   * @returns {Promise<Object>} Object mapping userId to karma points
   */
  async getMultipleUsersKarmaPoints(userIds) {
    try {
      const { data, error } = await supabase
        .from('karma_points')
        .select('user_id, total_karma_points')
        .in('user_id', userIds);

      if (error) throw error;

      // Convert array to object mapping userId to karma points
      return data.reduce((acc, curr) => {
        acc[curr.user_id] = curr.total_karma_points;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching multiple users karma points:', error);
      return {};
    }
  }
}; 