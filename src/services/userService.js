import { supabase } from '../lib/supabase';

export const userService = {
  // Save user preferences
  async saveUserPreferences(userId, preferences) {
    try {
      // First, save the user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          username: preferences.username,
          is_onboarding_complete: true,
          updated_at: new Date().toISOString(),
        });

      if (preferencesError) throw preferencesError;

      // Then, save the category preferences
      if (preferences.categories && preferences.categories.length > 0) {
        // First, get the actual category IDs from the database
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .in('name', preferences.categories);

        if (categoriesError) throw categoriesError;

        // Delete existing category preferences
        const { error: deleteError } = await supabase
          .from('user_category_preferences')
          .delete()
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        // Then, insert new category preferences with actual category IDs
        const categoryPreferences = categories.map(category => ({
          user_id: userId,
          category_id: category.id,
          is_favorite: true
        }));

        const { error: insertError } = await supabase
          .from('user_category_preferences')
          .insert(categoryPreferences);

        if (insertError) throw insertError;
      }

      // Finally, save notification settings
      if (preferences.notifications) {
        const { error: notificationsError } = await supabase
          .from('user_notification_settings')
          .upsert({
            user_id: userId,
            email_notifications: preferences.notifications.includes('new-comparisons'),
            push_notifications: preferences.notifications.includes('votes'),
            vote_notifications: preferences.notifications.includes('votes'),
            comment_notifications: preferences.notifications.includes('comments'),
            marketing_emails: preferences.notifications.includes('weekly-digest'),
            updated_at: new Date().toISOString(),
          });

        if (notificationsError) throw notificationsError;
      }

      return preferencesData;
    } catch (error) {
      throw error;
    }
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

      // Get category preferences with category names
      const { data: categoryPreferences, error: categoriesError } = await supabase
        .from('user_category_preferences')
        .select(`
          category_id,
          categories (
            name
          )
        `)
        .eq('user_id', userId);

      if (categoriesError) throw categoriesError;

      // Get notification settings
      const { data: notificationSettings, error: notificationsError } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (notificationsError) throw notificationsError;

      // Combine all preferences
      return {
        ...preferences,
        categories: categoryPreferences?.map(cp => cp.categories.name) || [],
        notifications: [
          ...(notificationSettings?.email_notifications ? ['new-comparisons'] : []),
          ...(notificationSettings?.vote_notifications ? ['votes'] : []),
          ...(notificationSettings?.comment_notifications ? ['comments'] : []),
          ...(notificationSettings?.marketing_emails ? ['weekly-digest'] : []),
        ]
      };
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
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !data; // Returns true if username is available
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