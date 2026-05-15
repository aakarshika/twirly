import apiClient from '../lib/apiClient';

export const getItem = async itemId => {
  const { data } = await apiClient.get(`/api/items/${itemId}`);
  return data.data ?? null;
};

export const getItemComparisonSets = async itemId => {
  const { data } = await apiClient.get(`/api/items/${itemId}/sets`);
  return data.data ?? [];
};

export const getItemComments = async (itemId, page = 1, pageSize = 10) => {
  const { data } = await apiClient.get(`/api/items/${itemId}/comments`, {
    params: { page, pageSize },
  });
  const { comments, total } = data.data;
  return { comments: comments ?? [], total, hasMore: total > page * pageSize };
};
