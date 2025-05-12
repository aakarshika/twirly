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
        page_route: feedback.page_route || window.location.pathname,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return data;
  },

  async getFeedbackList() {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('status', { ascending: true });

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
  },

  async deleteFeedback(id) {
    // First, get the feedback to check if it has an image
    const { data: feedback, error: fetchError } = await supabase
      .from('feedback')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // If there's an image, delete it from storage
    if (feedback?.image_url) {
      const imagePath = feedback.image_url.split('/').pop();
      const { error: storageError } = await supabase.storage
        .from(FEEDBACK_BUCKET)
        .remove([imagePath]);

      if (storageError) throw storageError;
    }

    // Delete the feedback record
    const { error: deleteError } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
  }
}; 