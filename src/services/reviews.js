import apiClient from '../lib/apiClient';

/**
 * Submit a review for an item.
 */
export const submitReview = async (itemId, _userId, text) => {
  const { data } = await apiClient.post(`/api/items/${itemId}/reviews`, { text });
  return { review: data.data };
};

/**
 * Like or unlike a review (toggle).
 */
export const likeReview = async (reviewId, _userId) => {
  const { data } = await apiClient.post(`/api/reviews/${reviewId}/like`);
  return data.data;
};

export const unlikeReview = async (reviewId) => {
  const { data } = await apiClient.delete(`/api/reviews/${reviewId}/like`);
  return data.data;
};

/**
 * Get paginated reviews for an item.
 */
export const getItemReviews = async (itemId, page = 1, limit = 10) => {
  const { data } = await apiClient.get(`/api/items/${itemId}/reviews`, {
    params: { page, pageSize: limit },
  });
  const { reviews, total, hasMore } = data.data;
  return { reviews, total, page, limit, hasMore };
};

/**
 * Get average metrics for an item from the backend.
 */
export const getItemAverageMetrics = async (itemId) => {
  const { data } = await apiClient.get(`/api/items/${itemId}/metrics`);
  return (data.data ?? []).reduce((acc, row) => {
    acc[row.metric_name] = { average: row.avg_rating, totalReviews: row.total_reviews };
    return acc;
  }, {});
};

/**
 * Get all reviews written by a user.
 */
export const getUserReviews = async (userId) => {
  const { data } = await apiClient.get(`/api/reviews/user/${userId}`);
  return (data.data?.reviews ?? []).map(r => ({
    id: r.id,
    productName: r.item_name,
    category: r.category_name,
    text: r.text,
    likes: r.likes,
    created_at: r.created_at,
  }));
};
