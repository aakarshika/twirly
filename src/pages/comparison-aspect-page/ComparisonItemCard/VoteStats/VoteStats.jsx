import React, { useState, useEffect } from 'react';
import './VoteStats.css';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../contexts/ThemeContext';
import { splitAndJoin } from '../../../../lib/utils';
import { SHOW_RESULTS_DURATION } from '../../../../lib/constants';

const VoteStats = ({ votes, totalVotes, color, _isVotedItem, leadingMetrics, userVotedAll }) => {
  const { currentTheme } = useTheme();
  const percentage = totalVotes > 0 && votes > 0 ? (votes / totalVotes) * 100 : 0;
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    let animationFrame;
    const startTime = performance.now();
    const duration = (SHOW_RESULTS_DURATION-1.5) * 1000; // Convert seconds to milliseconds

    const animate = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = progress * percentage;

      setDisplayPercentage(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayPercentage(percentage);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [percentage]);

  return (
    <div className="flex flex-col vote-stats-container">
      {((userVotedAll) && <div className="flex flex-row gap-1 w-full items-center">
        <span className="text-2xl text-right">
          {Math.round(displayPercentage)}%
        </span>
        <div className="vote-progress w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="progress-bar h-full"
            style={{
              width: `${displayPercentage}%`,
              backgroundColor: color,
              minWidth: '3px',
              transition: 'none',
            }}
          />
        </div>
      </div>)}
      {/* Leading Metrics */}
      {userVotedAll && leadingMetrics && leadingMetrics.length > 0 && (
        <div className="">
          <motion.div
            key={'icon-target'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span style={{ color: currentTheme.colors.secondary }}>
              <Target className="w-4 h-4 inline-block mr-1" />
              <span className="text-sm font-normal">Won{' '}</span>
              {leadingMetrics.map((metric, index) => (
                <span className="text-sm font-semibold" key={metric.metric_name}>
                  {splitAndJoin(metric.metric_name)}{index < leadingMetrics.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VoteStats;
