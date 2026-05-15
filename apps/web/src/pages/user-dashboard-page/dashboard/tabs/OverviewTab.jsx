import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ThumbsUp, BarChart2, Package, MessageSquare, Heart } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { getUserProfile } from '@services/users';
import { getWeeklyActivity, getRecentActivities, getActivityTrends } from '@services/activity';

const EASE = [0.16, 1, 0.3, 1];

const STAT_CONFIG = [
  { key: 'votes_count',       label: 'votes',       icon: ThumbsUp,      accent: t => t.red    },
  { key: 'comparisons_count', label: 'comparisons', icon: BarChart2,      accent: t => t.blue   },
  { key: 'products_count',    label: 'items',       icon: Package,        accent: t => t.purple  },
  { key: 'reviews_count',     label: 'reviews',     icon: MessageSquare,  accent: t => t.mustard },
  { key: 'likes_count',       label: 'likes',       icon: Heart,          accent: t => t.ink     },
];

const StatTile = ({ label, value, icon: Icon, accent, t, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.1 + index * 0.08, ease: EASE }}
    style={{
      background: t.bgDeep,
      border: `2px solid ${accent}`,
      borderRadius: 8,
      padding: '14px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      flex: '1 1 90px',
      minWidth: 90,
    }}
  >
    <Icon size={15} style={{ color: accent }} />
    <p style={{
      fontFamily: '"DM Serif Display", serif',
      fontStyle: 'italic',
      fontSize: 30,
      lineHeight: 1,
      color: t.ink,
      margin: 0,
    }}>
      {value ?? 0}
    </p>
    <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: t.ink, opacity: 0.6, margin: 0 }}>
      {label}
    </p>
  </motion.div>
);

const ChartTooltip = ({ active, payload, label, t }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: t.bgDeep,
      border: `1px solid ${t.ink}20`,
      borderRadius: 6,
      padding: '8px 12px',
    }}>
      <p style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: t.ink, opacity: 0.65, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{
          fontFamily: '"DM Serif Display", serif',
          fontStyle: 'italic',
          fontSize: 16,
          color: p.color,
          margin: 0,
        }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
};

const typeAccent = (type, t) => {
  const key = type?.toLowerCase();
  if (key === 'vote') return t.red;
  if (key === 'comment') return t.blue;
  if (key === 'comparison') return t.purple;
  if (key === 'review') return t.mustard;
  return t.ink;
};

const ActivityRow = ({ activity, t, index }) => {
  const accent = typeAccent(activity.type, t);
  const timeAgo = activity.createdAt
    ? formatDistanceToNow(parseISO(activity.createdAt), { addSuffix: true })
    : activity.timestamp;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: EASE }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 14 }}
    >
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: accent,
        marginTop: 5,
        flexShrink: 0,
      }} />
      <div>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, lineHeight: 1.4, margin: 0 }}>
          {activity.description}
        </p>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: t.ink, opacity: 0.5, margin: '2px 0 0' }}>
          {timeAgo}
        </p>
      </div>
    </motion.div>
  );
};

const OverviewTab = ({ userId, isPublic }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [profile, weekly, recent, trendData] = await Promise.all([
          getUserProfile(userId),
          getWeeklyActivity(),
          getRecentActivities(),
          getActivityTrends(),
        ]);
        if (cancelled) return;
        setStats(profile);
        setWeeklyData(weekly);
        setActivities(recent);
        setTrends(trendData);
      } catch (err) {
        console.error('OverviewTab load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return (
      <div style={{ padding: '32px 0', display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 18, color: t.ink, opacity: 0.5 }}>loading…</p>
      </div>
    );
  }

  const hasWeeklyData = weeklyData.length > 0;
  const hasActivities = activities.length > 0;
  const hasTrends = trends.weeklyActivity > 0 || trends.weeklyChange !== 0;

  return (
    <div className="pt-4 space-y-8">

      {/* Stats row */}
      <section>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 16, color: t.ink, opacity: 0.55, marginBottom: 10 }}>
          your numbers
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {STAT_CONFIG.map(({ key, label, icon, accent }, i) => (
            <StatTile
              key={key}
              label={label}
              value={stats?.[key] ?? 0}
              icon={icon}
              accent={accent(t)}
              t={t}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Trend pills (private only) */}
      {!isPublic && hasTrends && (
        <section>
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 16, color: t.ink, opacity: 0.55, marginBottom: 10 }}>
            this week
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{
              background: t.bgDeep,
              borderRadius: 8,
              padding: '14px 18px',
              border: `1px solid ${t.ink}15`,
            }}>
              <p style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 26, color: t.ink, margin: 0 }}>
                {trends.weeklyActivity ?? 0}
              </p>
              <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: t.ink, opacity: 0.55, margin: 0 }}>
                total actions
              </p>
            </div>
            {trends.weeklyChange !== undefined && (
              <div style={{
                background: t.bgDeep,
                borderRadius: 8,
                padding: '14px 18px',
                border: `1px solid ${trends.weeklyChange >= 0 ? t.blue : t.red}40`,
              }}>
                <p style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontStyle: 'italic',
                  fontSize: 26,
                  color: trends.weeklyChange >= 0 ? t.blue : t.red,
                  margin: 0,
                }}>
                  {trends.weeklyChange >= 0 ? '+' : ''}{trends.weeklyChange}%
                </p>
                <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: t.ink, opacity: 0.55, margin: 0 }}>
                  vs last week
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Weekly chart (private only) */}
      {!isPublic && hasWeeklyData && (
        <section>
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 16, color: t.ink, opacity: 0.55, marginBottom: 10 }}>
            activity this week
          </p>
          <div style={{
            background: t.bgDeep,
            borderRadius: 8,
            padding: '16px 12px 12px',
            border: `1px solid ${t.ink}10`,
          }}>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weeklyData} barGap={2} barCategoryGap="30%">
                <XAxis
                  dataKey="day_name"
                  tick={{ fontFamily: '"Caveat", cursive', fontSize: 12, fill: t.ink, fillOpacity: 0.6 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip t={t} />} cursor={{ fill: `${t.ink}07` }} />
                <Bar dataKey="activity_count" name="total" fill={t.red} radius={[3, 3, 0, 0]} />
                <Bar dataKey="votes_count" name="votes" fill={t.blue} radius={[3, 3, 0, 0]} />
                <Bar dataKey="comparisons_count" name="comps" fill={t.purple} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 6 }}>
              {[['total', t.red], ['votes', t.blue], ['comps', t.purple]].map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                  <span style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: t.ink, opacity: 0.6 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent activity */}
      <section>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 16, color: t.ink, opacity: 0.55, marginBottom: 12 }}>
          recent activity
        </p>
        {hasActivities ? (
          <div>
            {activities.slice(0, 12).map((activity, i) => (
              <ActivityRow key={i} activity={activity} t={t} index={i} />
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.ink, opacity: 0.45, lineHeight: 1.5 }}>
            Nothing yet — cast a vote or create a comparison to see activity here.
          </p>
        )}
      </section>

    </div>
  );
};

export default OverviewTab;
