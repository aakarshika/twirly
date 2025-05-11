import { supabase } from '../lib/supabaseClient';

const FEEDBACK_BUCKET = 'feedback-images';

export const feedbackService = {
  async submitFeedback(feedback) {
    let image_url = null;

    // Upload image if present
    if (feedback.image) {
      const fileExt = feedback.image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(FEEDBACK_BUCKET)
        .upload(filePath, feedback.image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(FEEDBACK_BUCKET)
        .getPublicUrl(filePath);

      image_url = publicUrl;
    }

    // Submit feedback
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        name: feedback.name,
        type: feedback.type,
        priority: feedback.priority,
        message: feedback.message,
        image_url,
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return data;
  },

  async getFeedbackList() {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateFeedbackStatus(id, status) {
    const { data, error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return data;
  }
}; 