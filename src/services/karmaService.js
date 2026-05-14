import apiClient from '../lib/apiClient';

export const karmaService = {
  async getUserKarmaPoints(userId) {
    const { data } = await apiClient.get('/api/karma', { params: { userId } });
    return data.data?.total_karma_points ?? 0;
  },

  async getMultipleUsersKarmaPoints(userIds) {
    if (!userIds.length) return {};
    const { data } = await apiClient.get('/api/karma', {
      params: { 'userIds[]': userIds },
    });
    return (data.data ?? []).reduce((acc, row) => {
      acc[row.user_id] = row.total_karma_points;
      return acc;
    }, {});
  },
};
