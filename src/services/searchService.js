import apiClient from '../lib/apiClient';

export const searchService = {
  searchAll: async (query) => {
    const { data } = await apiClient.get('/api/search', { params: { q: query, type: 'all' } });
    return data.data;
  },

  searchSets: async (query) => {
    const { data } = await apiClient.get('/api/search', { params: { q: query, type: 'sets' } });
    return data.data;
  },

  searchItems: async (query) => {
    const { data } = await apiClient.get('/api/search', { params: { q: query, type: 'items' } });
    return data.data;
  },

  searchUsers: async (query) => {
    const { data } = await apiClient.get('/api/search', { params: { q: query, type: 'users' } });
    return data.data;
  },
};
