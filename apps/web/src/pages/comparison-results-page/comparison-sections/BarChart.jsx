import React from 'react';
import { Play, Target, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import ComparisonSetAspectsCommentsSection from '../../comparison-aspect-page/ComparisonSetAspectsCommentsSection';

const formatMetricName = name =>
  name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const MetricCard = ({ metric, items, getMetricAverageVotes, userVoted, t }) => {
  const totalVotes = metric.votes.length;
  const navigate = useNavigate();

  return (
    <div
      className="rounded-sm p-4 cursor-pointer"
      style={{ background: t.bgDeep, border: `1px solid ${t.ink}0e` }}
      onClick={() => navigate(`/compare/${metric.set_id}`)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={13} style={{ color: `${t.ink}55`, flexShrink: 0 }} />
          <h3 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 16, color: t.ink }}>
            {formatMetricName(metric.metric_name)}
          </h3>
        </div>

        {userVoted ? (
          <div className="flex items-center gap-1">
            <ThumbsUp size={12} style={{ color: `${t.ink}50` }} />
            <span style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}55` }}>
              {totalVotes}
            </span>
          </div>
        ) : (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-sm"
            onClick={e => { e.stopPropagation(); navigate(`/compare/${metric.set_id}`); }}
            style={{ padding: '6px 14px', background: t.red, color: '#fff', fontFamily: '"Fraunces", serif', fontSize: 13, minHeight: 36 }}
          >
            vote <Play size={11} />
          </button>
        )}
      </div>

      {userVoted && (
        <div className="flex flex-col gap-2">
          {items.map(item => {
            const value = getMetricAverageVotes(item.id, metric.metric_name);
            const pct = totalVotes > 0 ? (value / totalVotes) * 100 : 0;
            return (
              <div key={item.id} className="flex items-center gap-2">
                <span
                  className="flex-1 min-w-0"
                  style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {item.name}
                </span>
                <span style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: `${t.ink}60`, minWidth: 18, textAlign: 'right' }}>
                  {value}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: `${t.ink}18`, minWidth: 40 }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: item.item_color_string, minWidth: pct > 0 ? 4 : 0, transition: 'width 0.5s ease' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const BarChart = ({ items, comparisonMetrics }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  const getMetricAverageVotes = (itemId, metricName) => {
    let count = 0;
    for (const metric of comparisonMetrics) {
      for (const vote of metric.votes) {
        if (vote.item_id === itemId && metric.metric_name === metricName) count++;
      }
    }
    return count;
  };

  return (
    <div className="flex flex-col gap-5 px-3 pb-6">
      <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}50`, paddingTop: 4 }}>
        per aspect
      </p>
      {comparisonMetrics.map(metric => (
        <div key={metric.metric_name} className="flex flex-col gap-4">
          <MetricCard
            metric={metric}
            items={items}
            getMetricAverageVotes={getMetricAverageVotes}
            userVoted={metric.userVoted}
            t={t}
          />
          {metric.userVoted && (
            <ComparisonSetAspectsCommentsSection
              aspectSetId={metric.id}
              items={items}
              aspectSet={metric}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default BarChart;
