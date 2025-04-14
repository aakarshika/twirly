import { supabase } from '../lib/supabase';
import { TEMP_USER_ID } from '../lib/constants';

/**
 * Get weekly activity data for a user
 * @returns {Promise<Array>} Array of daily activity counts
 */
export const getWeeklyActivity = async () => {
  try {
    const { data, error } = await supabase
      .from('user_weekly_activity')
      .select('*')
      .eq('user_id', TEMP_USER_ID)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    throw error;
  }
};

/**
 * Get recent activities for a user
 * @returns {Promise<Array>} Array of recent activities
 */
export const getRecentActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('user_recent_activities')
      .select('*')
      .eq('user_id', TEMP_USER_ID)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the data for display
    return data.map(activity => ({
      type: activity.activity_type,
      description: activity.description || 'Voted on an item',
      timestamp: formatTimestamp(activity.hours_ago)
    }));
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Get activity trends for a user
 * @returns {Promise<Object>} Object containing trend data
 */
export const getActivityTrends = async () => {
  try {
    const { data, error } = await supabase
      .from('user_activity_trends')
      .select('*')
      .eq('user_id', TEMP_USER_ID)
      .single();

    if (error) throw error;

    return {
      weeklyActivity: data.weekly_activity,
      weeklyChange: data.weekly_change_percentage,
      currentWeekActivity: data.current_week_activity,
      previousWeekActivity: data.previous_week_activity
    };
  } catch (error) {
    console.error('Error fetching activity trends:', error);
    throw error;
  }
};

/**
 * Get category distribution for a user's items
 * @returns {Promise<Array>} Array of category counts
 */
export const getCategoryDistribution = async () => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        category_id,
        categories (
          name
        )
      `)
      .eq('user_id', TEMP_USER_ID);

    if (error) throw error;

    // Count items per category
    const categoryCounts = data.reduce((acc, item) => {
      const categoryName = item.categories?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    // Convert to array format
    return Object.entries(categoryCounts).map(([name, count]) => ({
      label: name,
      value: count
    }));
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    throw error;
  }
};

/**
 * Format timestamp to human-readable format
 * @param {number} hoursAgo - Hours since the activity
 * @returns {string} Formatted timestamp
 */
const formatTimestamp = (hoursAgo) => {
  if (hoursAgo < 1) {
    return 'Less than an hour ago';
  } else if (hoursAgo < 24) {
    return `${Math.floor(hoursAgo)} hours ago`;
  } else {
    const days = Math.floor(hoursAgo / 24);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
}; 