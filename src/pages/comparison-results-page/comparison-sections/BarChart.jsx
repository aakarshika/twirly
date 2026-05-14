import React from 'react';
import { Play, Target, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ComparisonSetAspectsCommentsSection from '../../comparison-aspect-page/ComparisonSetAspectsCommentsSection';

const MetricCard = ({ metric, items, getMetricAverageVotes, userVoted }) => {
  const totalVotes = metric.votes.length;
  const navigate = useNavigate();
  return (
    <div className=""
    onClick={() => {
      navigate(`/compare/${metric.set_id}`);
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-text-muted" />
          <h3 className="text-md text-text-muted">{metric.metric_name.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1),
          ).join(' ')}</h3>
        </div>
        {userVoted && (<div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">{totalVotes} votes</span>
          </div>
        </div>)}

        {(!userVoted && <div className="flex flex-row justify-end items-center">
          <button className="bg-primary text-primary-fg px-4 py-2 rounded-md">
            <span className="flex items-center">Play <Play className="w-4 h-4 ml-2" /></span>
          </button>
        </div>)}
      </div>

      <div className="space-y-1">
        {items.map(item => {
          const value = getMetricAverageVotes(item.id, metric.metric_name);
          const percentage = (value / (totalVotes || 1)) * 100;

          return userVoted ? (
            <div key={item.id} className="flex flex-row items-center">
              <div className="flex flex-row w-full">
                <div className="flex  w-60">
                  <span className="text-sm font-medium text-text line-clamp-1">{item.name}</span>
                </div>
                <span className="text-sm text-text-muted ml-2 w-6">{value} </span>
                <div className="flex w-full bg-surface rounded-full h-4">
                  <div
                    className="flex rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.item_color_string,
                    }}
                  >
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

const BarChart = ({ items,  comparisonMetrics }) => {

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
      <div  className={`grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2`}
                  style={{
                    gap: '1vh',
                  }}>
        {comparisonMetrics.map(metric => {

          return (
          <div key={metric.metric_name}>
          <MetricCard
            key={metric.metric_name}
            metric={metric}
            items={items}
            getMetricAverageVotes={getMetricAverageVotes}
            userVoted={metric.userVoted}
          />
          <div className="mt-4 mb-8">

          <ComparisonSetAspectsCommentsSection
            userVoted={true}
            aspectSetId={metric.id}
            items={items}
            aspectSet={metric}
          />
          </div>
          </div>
        );})}
      </div>
    </div>
  );
};

export default BarChart;
