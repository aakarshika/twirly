import apiClient from '../lib/apiClient';

export const getUserVotes = async _userId => {
  const { data } = await apiClient.get('/api/votes');
  return data.data;
};

export const checkUserVotedSet = async setId => {
  const { data } = await apiClient.get('/api/votes/check', { params: { setId } });
  return !!data.data;
};
