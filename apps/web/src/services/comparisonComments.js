import apiClient from '../lib/apiClient';

function transformComment(c) {
  return {
    id: c.id,
    text: c.content,
    created_at: c.created_at,
    user: { display_name: c.display_name, profile_image_url: c.profile_image_url },
    reactions: c.reactions ?? [],
    replies: (c.replies ?? []).map(r => ({
      id: r.id,
      text: r.content,
      created_at: r.created_at,
      user: { display_name: r.display_name, profile_image_url: r.profile_image_url },
      reactions: r.reactions ?? [],
    })),
  };
}

export const comparisonComments = {
  async fetchComments(setId, _userId, page = 1, pageSize = 3) {
    const { data } = await apiClient.get(`/api/comparisons/${setId}/comments`, {
      params: { page, pageSize },
    });
    const raw = data.data;
    return {
      comments: (raw.comments ?? []).map(transformComment),
      total: raw.total,
      page: raw.page,
      limit: pageSize,
      hasMore: raw.hasMore,
    };
  },

  async postComment(setId, _userId, text) {
    const { data } = await apiClient.post(`/api/comparisons/${setId}/comments`, { content: text });
    return data.data;
  },

  async postReply(commentId, _userId, text) {
    const { data } = await apiClient.post(`/api/comments/${commentId}/replies`, { content: text });
    return data.data;
  },

  async toggleCommentLike(commentId, _userId, hasLiked) {
    if (hasLiked) {
      await apiClient.delete(`/api/comments/${commentId}/react`);
    } else {
      await apiClient.post(`/api/comments/${commentId}/react`, { reactionType: 'like' });
    }
  },

  async toggleReplyLike(replyId, _userId, hasLiked) {
    if (hasLiked) {
      await apiClient.delete(`/api/comments/${replyId}/react`);
    } else {
      await apiClient.post(`/api/comments/${replyId}/react`, { reactionType: 'like' });
    }
  },
};
