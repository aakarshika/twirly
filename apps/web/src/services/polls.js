import apiClient from '../lib/apiClient';

export const getUserPolls = async () => {
  const { data } = await apiClient.get('/api/polls');
  return data.data;
};
