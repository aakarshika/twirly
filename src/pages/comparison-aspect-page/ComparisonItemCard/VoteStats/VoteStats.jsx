import React from 'react';
import './VoteStats.css';
import { Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../../contexts/ThemeContext';
import { splitAndJoin } from '../../../../lib/utils';

const VoteStats = ({ votes, totalVotes, color, isVotedItem, leadingMetrics }) => {
  const { currentTheme } = useTheme();
  const percentage = totalVotes > 0 && votes > 0 ? (votes / totalVotes) * 100 : 0;
  
  return (
    <div className="flex flex-col vote-stats-container">
      {votes > 0 && (<div className="flex flex-row gap-1 w-full items-center">
        <span className="text-sm text-right">{Math.round(percentage)}%</span>
        <div className="vote-progress w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="progress-bar h-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              minWidth: '3px'
            }}
          />
        </div>
      </div>)}
      {/* Leading Metrics */}
      {leadingMetrics && leadingMetrics.length > 0 && (
        <div className="">
          <motion.div 
            key={'icon-target'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span style={{ color: currentTheme.colors.secondary }}>
              <Target className="w-4 h-4 inline-block mr-1" />
              <span className="text-sm font-normal">Shining at{' '}</span>
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