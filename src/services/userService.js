import { supabase } from '../lib/supabase';

export const userService = {
  // Save user preferences
  async saveUserPreferences(userId, preferences) {
    // console.log("saving preferences", preferences);
    try {
      // First, save the user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert( preferences.id ? {
          user_id: userId,
          id: preferences.id,
          display_name: preferences.display_name,
          is_onboarding_complete: true,
          updated_at: new Date(),
        } : {
          user_id: userId,
          display_name: preferences.display_name,
          is_onboarding_complete: true,
          updated_at: new Date(),
        });

      if (preferencesError) throw preferencesError;

      // Then, save the category preferences
      if (preferences.categories && preferences.categories.length > 0) {
        
        // Delete existing category preferences
        const { data: deleteData, error: deleteError } = await supabase
          .from('user_category_preferences')
          .delete()
          .eq('user_id', userId);
        // console.log("deleteData", deleteData);
        // console.log("deleteError", deleteError);

        if (deleteError) throw deleteError;

        // Then, insert new category preferences with actual category IDs
        const categoryPreferences = preferences.categories.map(category => ({
          user_id: userId,
          category_id: category,
          is_favorite: true
        }));

        const { data: categorySuccess, error: insertError } = await supabase
          .from('user_category_preferences')
          .insert(categoryPreferences);

        if (insertError) throw insertError;
      }

      // Finally, save notification settings
      if (preferences.notifications && preferences.notifications.length > 0) {
        
        if(preferences.notifId) {
        const { error: deleteError } = await supabase
          .from('user_notification_settings')
          .delete()
          .eq('id', preferences.notifId);

          if (deleteError) throw deleteError;
        }

        const { data: notifSuccess, error: notificationsError } = await supabase
          .from('user_notification_settings')
          .insert( preferences.notifId ? {
            user_id: userId,
            id: preferences.notifId,
            email_notifications: preferences.notifications.includes('new-comparisons'),
            push_notifications: preferences.notifications.includes('votes'),
            comment_notifications: preferences.notifications.includes('comments'),
            marketing_emails: preferences.notifications.includes('weekly-digest'),
            updated_at: new Date(),
          } : {
            user_id: userId,
            email_notifications: preferences.notifications.includes('new-comparisons'),
            push_notifications: preferences.notifications.includes('votes'),
            comment_notifications: preferences.notifications.includes('comments'),
            marketing_emails: preferences.notifications.includes('weekly-digest'),
          });

        if (notificationsError) throw notificationsError;
      }

      return preferencesData && notifSuccess && categorySuccess;
    } catch (error) {
      throw error;
    }
  },

  // Get all categories
  async getAllCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    return data;
  },

  // Get user notification settings
  async getUserNotificationSettings(userId) {
    const { data, error } = await supabase.from('user_notification_settings').select('*').eq('user_id', userId).single();
    return {...data, notifications: [
      ...(data?.email_notifications ? ['new-comparisons'] : []),
      ...(data?.push_notifications ? ['votes'] : []),
      ...(data?.comment_notifications ? ['comments'] : []),
      ...(data?.marketing_emails ? ['weekly-digest'] : []),
    ]};
  },

  // Get user category preferences
  async getUserCategoryPreferences(userId) {
    const { data, error } = await supabase.from('user_category_preferences').select('*').eq('user_id', userId);
    return data;
  },
  
  
  // Get user preferences
  async getUserPreferences(userId) {
    try {
      // Get user preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError) throw preferencesError;


      // Combine all preferences
      return preferences;
    } catch (error) {
      throw error;
    }
  },

  // Check if username is available
  async checkUsernameAvailability(username) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('username')
        .eq('username', username)
        .select();

      if (error && error.code !== 'PGRST116') throw error;
      return !data || data.length === 0; // Returns true if username is available
    } catch (error) {
      throw error;
    }
  },

  // Delete user preferences
  async deleteUserPreferences(userId) {
    try {
      // Delete from all preference tables
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (preferencesError) throw preferencesError;

      const { error: categoriesError } = await supabase
        .from('user_category_preferences')
        .delete()
        .eq('user_id', userId);

      if (categoriesError) throw categoriesError;

      const { error: notificationsError } = await supabase
        .from('user_notification_settings')
        .delete()
        .eq('user_id', userId);

      if (notificationsError) throw notificationsError;
    } catch (error) {
      throw error;
    }
  },
}; 