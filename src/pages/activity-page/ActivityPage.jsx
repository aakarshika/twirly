import React, { useEffect, useState } from 'react';
import { ThumbsUp, MessageSquare, Plus, Star, Activity } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLoading } from '../../contexts/LoadingContext';
import { getRecentActivities } from '../user-dashboard-page/activity';

const ACTIVITY_ICONS = {
  vote: ThumbsUp,
  comment: MessageSquare,
  comparison: Plus,
  review: Star,
};

const ACTIVITY_LABELS = {
  vote: 'Vote',
  comment: 'Comment',
  comparison: 'Comparison',
  review: 'Review',
};

const getActivityIcon = type => {
  const key = type?.toLowerCase();
  return ACTIVITY_ICONS[key] || Activity;
};

const getActivityLabel = type => {
  const key = type?.toLowerCase();
  return ACTIVITY_LABELS[key] || type || 'Activity';
};

const ActivityCard = ({ activity }) => {
  const { currentTheme } = useTheme();
  const Icon = getActivityIcon(activity.type);
  const label = getActivityLabel(activity.type);

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface"
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: currentTheme.colors.primary + '20' }}
      >
        <Icon size={16} style={{ color: currentTheme.colors.primary }} />
      </div>
      <div className="flex-1 min-w-0">
        <span
          className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1"
          style={{
            backgroundColor: currentTheme.colors.primary + '18',
            color: currentTheme.colors.primary,
          }}
        >
          {label}
        </span>
        <p className="text-sm text-text leading-snug truncate">{activity.description}</p>
        <p className="text-xs text-text-muted mt-1">{activity.timestamp}</p>
      </div>
    </div>
  );
};

const ActivityPage = () => {
  const { currentTheme } = useTheme();
  const { setLoading, setError } = useLoading();
  const [activities, setActivities] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLocalLoading(true);
      setLocalError(null);
      setLoading('activity', true, 'Loading activity...');
      try {
        const data = await getRecentActivities(50);
        if (mounted) setActivities(data);
      } catch (err) {
        console.error('[ActivityPage] Failed to load activities:', err);
        if (mounted) setLocalError('Failed to load activity. Please try again.');
        setError('activity', 'Failed to load activity. Please try again.', () => window.location.reload());
      } finally {
        if (mounted) setLocalLoading(false);
        setLoading('activity', false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen text-text">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: currentTheme.colors.text }}
        >
          Activity
        </h1>

        {localLoading && (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-border bg-surface animate-pulse"
              />
            ))}
          </div>
        )}

        {!localLoading && localError && (
          <div className="text-center py-16">
            <Activity size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-text-muted text-sm">{localError}</p>
          </div>
        )}

        {!localLoading && !localError && activities.length === 0 && (
          <div className="text-center py-16">
            <Activity size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-text-muted text-sm">No recent activity yet</p>
          </div>
        )}

        {!localLoading && !localError && activities.length > 0 && (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <ActivityCard key={index} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
