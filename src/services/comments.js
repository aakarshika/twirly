import apiClient from '../lib/apiClient';

/**
 * Get all comments made by the logged-in user on comparison sets.
 * _userId param kept for backward compat; auth comes from session.
 */
export const getUserComments = async (_userId, page = 1, limit = 10) => {
  const { data } = await apiClient.get('/api/comments/mine', {
    params: { page, pageSize: limit },
  });
  const raw = data.data;
  return {
    comments: raw.comments ?? [],
    total: raw.total,
    page,
    limit,
    hasMore: raw.hasMore,
  };
};
