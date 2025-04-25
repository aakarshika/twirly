import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { COMPARISON_COLOR_SET } from '../../../lib/constants';
import ComparisonSetAspectsCommentsSection from '../../comparison/ComparisonSetAspectsCommentsSection';
import Button from '../../common/Button';
import { Info, MessageSquareShare, Play, Share, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const BarChart = ({ items, itemReviews, comparisonMetrics }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  // Extract all unique metrics from the reviews
  const metricsArray = React.useMemo(() => {
    if (!itemReviews) return [];
    const metrics = new Set();
    Object.values(itemReviews).forEach(item => {
      if (item.metrics) {
        Object.keys(item.metrics).forEach(metric => metrics.add(metric));
      }
    });
    return Array.from(metrics);
  }, [itemReviews]);
  console.log(comparisonMetrics);

  // Get the average value for a metric for a specific item
  const getMetricAverage = (itemId, metricName) => {
    if (!itemReviews?.[itemId]?.metrics?.[metricName]) return 0;
    return itemReviews[itemId].metrics[metricName].average;
  };

  const getMetricAverageVotes = (itemId, metricName) => {
    var itemVotes = 0;
    comparisonMetrics.forEach(metric => {
      metric.votes.forEach(vote => {
        if (vote.item_id === itemId && metric.metric_name === metricName) {
          itemVotes++;
        }
      });
    });
    return itemVotes;
  };

  return (
    <div className="w-full">
      <div
      >
        {comparisonMetrics.map(metric => (
          <div
            className="divide-y"
          >
            <div
              key={metric.metric_name}
              className=""
            >

              <div className="flex-1 ">
                <div className="h-auto rounded-sm overflow-hidden">
                  <div className="text-center" style={{ color: currentTheme.colors.text, backgroundColor: 'white' }}>
                    <div className="flex items-center justify-between">
                      <h4
                        className="truncate block "
                        style={{ color: currentTheme.colors.textSecondary, textAlign: 'left' }}
                    >
                      {metric.metric_name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </h4>
                    <Button onClick={() => {
                      console.log(metric);
                      navigate(`/comparison-aspect/${metric.id}`);
                    }} className="flex items-center gap-2">
                      <Play size={16} />
                    </Button>
                    </div>
                    <div className="flex items-center gap-2">

                      <div className="flex-1 flex gap-1">

                        {items.map((item, i) => {
                          const value = getMetricAverageVotes(item.id, metric.metric_name);
                          const percentage = (value / (metric.votes.length || 1)) * 100;
                          console.log(value);
                          console.log(percentage);

                          return (
                            <div key={item.id}>
                              <div className="flex-1 min-w-[6rem]">
                                <span
                                  className="text-xs font-medium block truncate "
                                  style={{ color: currentTheme.colors.textSecondary, textAlign: 'left' }}
                                >
                                  {item.name}
                                </span>
                              </div>
                              <div className="flex-1 min-w-[6rem]">
                                <div
                                  className="h-auto rounded-sm overflow-hidden"
                                  style={{ backgroundColor: currentTheme.colors.background }}
                                >

                                  <div
                                    className="h-full rounded-sm transition-all duration-300 flex items-center justify-end px-1"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: currentTheme.colors[item.color] || COMPARISON_COLOR_SET[i]
                                    }}
                                  >
                                    <span
                                      className="text-[10px] font-medium"
                                      style={{
                                        color: 'white',
                                        opacity: percentage < 25 ? 0 : 1,
                                        textShadow: `0 1px 1px ${currentTheme.colors.shadow}`
                                      }}
                                    >
                                      {value.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="w-full mt-4" style={{ textAlign: 'left' }}>
                      <ComparisonSetAspectsCommentsSection aspectSetId={metric.id} items={items} aspectSet={metric} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart; 