import { apiClient } from '../lib/apiClient';

async function uploadImage(file, bucket = 'feedback-images') {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post(`/api/uploads?bucket=${bucket}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.url;
}

export const feedbackService = {
  async submitFeedback(feedback) {
    let imageUrl = null;

    if (feedback.image) {
      imageUrl = await uploadImage(feedback.image, 'feedback-images');
    }

    const { data } = await apiClient.post('/feedback', {
      name: feedback.name,
      type: feedback.type,
      priority: feedback.priority,
      message: feedback.message,
      imageUrl,
      pageRoute: feedback.page_route ?? window.location.pathname,
    });

    return data.data;
  },

  async getFeedbackList() {
    const { data } = await apiClient.get('/feedback');
    return data.data;
  },

  async updateFeedbackStatus(id, status) {
    const { data } = await apiClient.put(`/feedback/${id}/status`, { status });
    return data.data;
  },

  async deleteFeedback(id) {
    await apiClient.delete(`/feedback/${id}`);
  },
};
