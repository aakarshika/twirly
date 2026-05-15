import apiClient from '../lib/apiClient';

const formatTimestamp = isoString => {
  if (!isoString) return 'Unknown';
  const hoursAgo = (Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 1) return 'Less than an hour ago';
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)} hours ago`;
  const days = Math.floor(hoursAgo / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
};

export const getWeeklyActivity = async () => {
  const { data: resp } = await apiClient.get('/api/activity/weekly');
  return resp.data ?? [];
};

export const getRecentActivities = async (limit = 20) => {
  const { data: resp } = await apiClient.get('/api/activity', { params: { limit } });
  const rows = resp.data ?? [];
  return rows.map(a => ({
    type: a.activity_type,
    description: a.metadata?.description || `${a.activity_type} on ${a.entity_type}`,
    timestamp: formatTimestamp(a.created_at),
    createdAt: a.created_at,
  }));
};

export const getActivityTrends = async () => {
  const { data: resp } = await apiClient.get('/api/activity/trends');
  const d = resp.data ?? {};
  return {
    weeklyActivity: d.weeklyActivity ?? 0,
    weeklyChange: d.weeklyChangePercentage ?? 0,
    currentWeekActivity: d.currentWeekActivity ?? 0,
    previousWeekActivity: d.previousWeekActivity ?? 0,
  };
};

export const getCategoryDistribution = async () => {
  const { data: resp } = await apiClient.get('/api/users/me/category-preferences');
  const prefs = resp.data ?? [];
  return prefs.map(p => ({ label: p.category_name, value: 1 }));
};
