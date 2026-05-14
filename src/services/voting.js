import apiClient from '../lib/apiClient';

/**
 * Cast or update a vote. Caller passes (voteData, user) for backward compat;
 * auth comes from the session cookie so user is not sent to the server.
 */
export const castVote = async (voteData, _user) => {
  await apiClient.post('/api/votes', { setId: voteData.setId, itemId: voteData.itemId });
  return true;
};

/** Count of votes for a specific item in a set. */
export const getVoteCount = async (setId, itemId) => {
  const { data } = await apiClient.get('/api/votes/count', { params: { setId, itemId } });
  return data.data?.count ?? 0;
};

/**
 * Check if the logged-in user has voted in a set.
 * user param kept for backward compat; auth comes from session.
 */
export const hasUserVoted = async (setId, _user) => {
  const { data } = await apiClient.get('/api/votes/check', { params: { setId } });
  return !!data.data;
};

/**
 * Revert (delete) the logged-in user's vote in a set.
 * setId-based delete — no vote id needed.
 */
export const revertVote = async (setId, _user) => {
  try {
    await apiClient.delete('/api/votes', { params: { setId } });
    return true;
  } catch {
    return false;
  }
};
