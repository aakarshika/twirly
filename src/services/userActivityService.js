import { supabase } from '../lib/supabaseClient';

// Activity type constants
export const ACTIVITY_TYPES = {
  ASPECT_SET_VIEW: 'aspect_set_view',
  ASPECT_SET_NEXT: 'aspect_set_next',
  COMPARISON_SET_VIEW: 'comparison_set_view',
  VOTE: 'vote',
  VOTE_REVERT: 'vote_revert',
  COMMENT: 'comment',
  COMMENT_REPLY: 'comment_reply',
  LIKE: 'like',
  DISLIKE: 'dislike',
  CREATE_COMPARISON_SET: 'create_comparison_set',
  CREATE_ASPECT_SET: 'create_aspect_set',
  EDIT_COMPARISON_SET: 'edit_comparison_set',
  EDIT_ASPECT_SET: 'edit_aspect_set',
  // Like/Dislike activity types
  LIKE_COMMENT: 'like_comment',
  DISLIKE_COMMENT: 'dislike_comment',
  LIKE_REPLY: 'like_reply',
  DISLIKE_REPLY: 'dislike_reply',
  LIKE_COMPARISON_SET: 'like_comparison_set',
  DISLIKE_COMPARISON_SET: 'dislike_comparison_set',
  LIKE_ASPECT_SET: 'like_aspect_set',
  DISLIKE_ASPECT_SET: 'dislike_aspect_set',
  // Unlike/Undislike activity types
  UNLIKE_COMMENT: 'unlike_comment',
  UNDISLIKE_COMMENT: 'undislike_comment',
  UNLIKE_REPLY: 'unlike_reply',
  UNDISLIKE_REPLY: 'undislike_reply',
  UNLIKE_COMPARISON_SET: 'unlike_comparison_set',
  UNDISLIKE_COMPARISON_SET: 'undislike_comparison_set',
  UNLIKE_ASPECT_SET: 'unlike_aspect_set',
  UNDISLIKE_ASPECT_SET: 'undislike_aspect_set'
};

// Entity type constants
export const ENTITY_TYPES = {
  COMPARISON_SET: 'comparison_set',
  ASPECT_SET: 'aspect_set',
  COMMENT: 'comment',
  REPLY: 'reply',
  VOTE: 'vote'
};

// Karma points mapping for different activities
const KARMA_POINTS = {
  [ACTIVITY_TYPES.ASPECT_SET_VIEW]: 1,
  [ACTIVITY_TYPES.ASPECT_SET_NEXT]: 1,
  [ACTIVITY_TYPES.COMPARISON_SET_VIEW]: 1,
  [ACTIVITY_TYPES.VOTE]: 2,
  [ACTIVITY_TYPES.VOTE_REVERT]: -2,
  [ACTIVITY_TYPES.COMMENT]: 5,
  [ACTIVITY_TYPES.COMMENT_REPLY]: 3,
  [ACTIVITY_TYPES.LIKE]: 1,
  [ACTIVITY_TYPES.DISLIKE]: -1,
  [ACTIVITY_TYPES.CREATE_COMPARISON_SET]: 10,
  [ACTIVITY_TYPES.CREATE_ASPECT_SET]: 10,
  [ACTIVITY_TYPES.EDIT_COMPARISON_SET]: 5,
  [ACTIVITY_TYPES.EDIT_ASPECT_SET]: 5,
  // Like/Dislike karma points
  [ACTIVITY_TYPES.LIKE_COMMENT]: 2,
  [ACTIVITY_TYPES.DISLIKE_COMMENT]: -2,
  [ACTIVITY_TYPES.LIKE_REPLY]: 1,
  [ACTIVITY_TYPES.DISLIKE_REPLY]: -1,
  [ACTIVITY_TYPES.LIKE_COMPARISON_SET]: 3,
  [ACTIVITY_TYPES.DISLIKE_COMPARISON_SET]: -3,
  [ACTIVITY_TYPES.LIKE_ASPECT_SET]: 3,
  [ACTIVITY_TYPES.DISLIKE_ASPECT_SET]: -3,
  // Unlike/Undislike karma points (negative of their corresponding like/dislike)
  [ACTIVITY_TYPES.UNLIKE_COMMENT]: -2,
  [ACTIVITY_TYPES.UNDISLIKE_COMMENT]: 2,
  [ACTIVITY_TYPES.UNLIKE_REPLY]: -1,
  [ACTIVITY_TYPES.UNDISLIKE_REPLY]: 1,
  [ACTIVITY_TYPES.UNLIKE_COMPARISON_SET]: -3,
  [ACTIVITY_TYPES.UNDISLIKE_COMPARISON_SET]: 3,
  [ACTIVITY_TYPES.UNLIKE_ASPECT_SET]: -3,
  [ACTIVITY_TYPES.UNDISLIKE_ASPECT_SET]: 3
};

export const userActivityService = {
  /**
   * Log a user activity
   * @param {Object} params
   * @param {string} params.userId - The UUID of the user performing the activity
   * @param {string} params.activityType - Type of activity (from ACTIVITY_TYPES)
   * @param {string} params.entityType - Type of entity (from ENTITY_TYPES)
   * @param {number} params.entityId - ID of the entity
   * @param {string} params.pageName - The page/route where the activity occurred
   * @param {Object} [params.metadata] - Additional metadata about the activity
   * @returns {Promise<Object>} The created activity log entry
   */
  async logActivity({ userId, activityType, entityType, entityId, pageName, metadata = {} }) {
    try {
      // Validate activity type
      if (!Object.values(ACTIVITY_TYPES).includes(activityType)) {
        throw new Error(`Invalid activity type: ${activityType}`);
      }

      // Validate entity type
      if (!Object.values(ENTITY_TYPES).includes(entityType)) {
        throw new Error(`Invalid entity type: ${entityType}`);
      }

      // Get karma points for this activity
      const karmaPoints = KARMA_POINTS[activityType] || 0;

      const { data, error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          activity_type: activityType,
          entity_type: entityType,
          entity_id: entityId,
          karma_points: karmaPoints,
          page_name: pageName,
          metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging user activity:', error);
      throw error;
    }
  },

  /**
   * Get recent activities for a user
   * @param {string} userId - The UUID of the user
   * @param {number} [limit=10] - Maximum number of activities to return
   * @returns {Promise<Array>} Array of recent activities
   */
  async getUserRecentActivities(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  },

  /**
   * Get activity count for a specific activity type
   * @param {string} userId - The UUID of the user
   * @param {string} activityType - Type of activity to count
   * @returns {Promise<number>} Count of activities
   */
  async getActivityCount(userId, activityType) {
    try {
      const { count, error } = await supabase
        .from('user_activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('activity_type', activityType);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting activity count:', error);
      return 0;
    }
  }
}; 