import apiClient from '../lib/apiClient';

export const getUserVotes = async _userId => {
  const { data } = await apiClient.get('/api/votes');
  return data.data;
};
