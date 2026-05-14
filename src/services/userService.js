import apiClient from '../lib/apiClient';

/** Converts notification settings row → array of notification-type strings. */
function toNotificationsArray(row) {
  if (!row) return [];
  return [
    ...(row.email_notifications   ? ['new-comparisons'] : []),
    ...(row.push_notifications    ? ['votes']           : []),
    ...(row.comment_notifications ? ['comments']        : []),
    ...(row.marketing_emails      ? ['weekly-digest']   : []),
  ];
}

export const userService = {
  async getUserPreferences(userId) {
    try {
      const { data } = await apiClient.get(`/api/users/${userId}`);
      return data.data ?? null;
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  async getUserNotificationSettings(userId) {
    try {
      const { data } = await apiClient.get('/api/users/me/notifications');
      const row = data.data;
      if (!row) return { notifications: [] };
      return { ...row, notifications: toNotificationsArray(row) };
    } catch (err) {
      if (err.response?.status === 404) return { notifications: [] };
      throw err;
    }
  },

  async getUserCategoryPreferences(userId) {
    try {
      const { data } = await apiClient.get('/api/users/me/category-preferences');
      return data.data ?? [];
    } catch (err) {
      if (err.response?.status === 404) return [];
      throw err;
    }
  },

  async getAllCategories() {
    const { data } = await apiClient.get('/api/categories', { params: { limit: 100 } });
    return data.data ?? [];
  },

  async checkUsernameAvailability(username) {
    const { data } = await apiClient.get('/api/users/check-username', { params: { username } });
    return data.data?.available ?? false;
  },

  /**
   * Save display_name, category preferences, and notification settings.
   * Mirrors the old Supabase multi-table write used by OnboardingFlow.
   */
  async saveUserPreferences(userId, preferences) {
    const ops = [];

    if (preferences.display_name) {
      ops.push(apiClient.put('/api/users/me', { displayName: preferences.display_name }));
    }

    if (preferences.categories?.length > 0) {
      ops.push(apiClient.put('/api/users/me/category-preferences', {
        categoryIds: preferences.categories.map(c => parseInt(c, 10)).filter(Boolean),
      }));
    }

    if (preferences.notifications?.length > 0) {
      ops.push(apiClient.put('/api/users/me/notifications', {
        emailNotifications:   preferences.notifications.includes('new-comparisons'),
        pushNotifications:    preferences.notifications.includes('votes'),
        commentNotifications: preferences.notifications.includes('comments'),
        marketingEmails:      preferences.notifications.includes('weekly-digest'),
      }));
    }

    await Promise.all(ops);
  },

  async deleteUserPreferences(userId) {
    await apiClient.delete('/api/users/me');
  },
};
