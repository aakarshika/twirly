import { apiClient } from '../lib/apiClient';

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
  LIKE_COMMENT: 'like_comment',
  DISLIKE_COMMENT: 'dislike_comment',
  LIKE_REPLY: 'like_reply',
  DISLIKE_REPLY: 'dislike_reply',
  LIKE_COMPARISON_SET: 'like_comparison_set',
  DISLIKE_COMPARISON_SET: 'dislike_comparison_set',
  LIKE_ASPECT_SET: 'like_aspect_set',
  DISLIKE_ASPECT_SET: 'dislike_aspect_set',
  UNLIKE_COMMENT: 'unlike_comment',
  UNDISLIKE_COMMENT: 'undislike_comment',
  UNLIKE_REPLY: 'unlike_reply',
  UNDISLIKE_REPLY: 'undislike_reply',
  UNLIKE_COMPARISON_SET: 'unlike_comparison_set',
  UNDISLIKE_COMPARISON_SET: 'undislike_comparison_set',
  UNLIKE_ASPECT_SET: 'unlike_aspect_set',
  UNDISLIKE_ASPECT_SET: 'undislike_aspect_set',
};

export const ENTITY_TYPES = {
  COMPARISON_SET: 'comparison_set',
  ASPECT_SET: 'aspect_set',
  COMMENT: 'comment',
  REPLY: 'reply',
  VOTE: 'vote',
};

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
  [ACTIVITY_TYPES.LIKE_COMMENT]: 2,
  [ACTIVITY_TYPES.DISLIKE_COMMENT]: -2,
  [ACTIVITY_TYPES.LIKE_REPLY]: 1,
  [ACTIVITY_TYPES.DISLIKE_REPLY]: -1,
  [ACTIVITY_TYPES.LIKE_COMPARISON_SET]: 3,
  [ACTIVITY_TYPES.DISLIKE_COMPARISON_SET]: -3,
  [ACTIVITY_TYPES.LIKE_ASPECT_SET]: 3,
  [ACTIVITY_TYPES.DISLIKE_ASPECT_SET]: -3,
  [ACTIVITY_TYPES.UNLIKE_COMMENT]: -2,
  [ACTIVITY_TYPES.UNDISLIKE_COMMENT]: 2,
  [ACTIVITY_TYPES.UNLIKE_REPLY]: -1,
  [ACTIVITY_TYPES.UNDISLIKE_REPLY]: 1,
  [ACTIVITY_TYPES.UNLIKE_COMPARISON_SET]: -3,
  [ACTIVITY_TYPES.UNDISLIKE_COMPARISON_SET]: 3,
  [ACTIVITY_TYPES.UNLIKE_ASPECT_SET]: -3,
  [ACTIVITY_TYPES.UNDISLIKE_ASPECT_SET]: 3,
};

export const userActivityService = {
  async logActivity({ activityType, entityType, entityId, pageName, metadata = {} }) {
    try {
      const karmaPoints = KARMA_POINTS[activityType] ?? 0;
      await apiClient.post('/activity', { activityType, entityType, entityId, karmaPoints, pageName, metadata });
    } catch {
      // fire-and-forget: swallow errors so callers are never interrupted
    }
  },

  async getUserRecentActivities(userId, limit = 10) {
    try {
      const { data } = await apiClient.get('/activity', { params: { userId, limit } });
      return data.data ?? [];
    } catch {
      return [];
    }
  },

  async getActivityCount(userId, activityType) {
    try {
      const { data } = await apiClient.get('/activity/count', { params: { userId } });
      return data.data?.total ?? 0;
    } catch {
      return 0;
    }
  },
};
