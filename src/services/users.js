import apiClient from '../lib/apiClient';

/**
 * Get a user's profile + activity counts.
 * Returns the nested shape { profile, votes_count, ... } that ProfileHeader + ContentTabs expect.
 */
export const getUserProfile = async userId => {
  const { data } = await apiClient.get(`/api/users/${userId}`);
  const u = data.data;
  if (!u) return null;
  return {
    profile: {
      user_id:           u.user_id,
      display_name:      u.display_name,
      username:          u.username,
      profile_image_url: u.profile_image_url,
      bio:               u.bio,
      created_at:        u.created_at,
      updated_at:        u.updated_at,
    },
    votes_count:        u.total_votes,
    reviews_count:      u.total_reviews,
    products_count:     u.total_products,
    comparisons_count:  u.total_comparisons,
    likes_count:        u.total_likes_received,
  };
};

export const updateUserProfile = async profileData => {
  const { data } = await apiClient.put('/api/users/me', {
    displayName:     profileData.display_name ?? profileData.displayName,
    username:        profileData.username,
    profileImageUrl: profileData.profile_image_url ?? profileData.profileImageUrl,
    bio:             profileData.bio,
  });
  return data.data;
};
