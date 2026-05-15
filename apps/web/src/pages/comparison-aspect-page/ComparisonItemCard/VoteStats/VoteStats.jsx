import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { splitAndJoin } from '@utils/utils';
import { SHOW_RESULTS_DURATION } from '@utils/constants';

const VoteStats = ({ votes, totalVotes, color, leadingMetrics, userVotedAll }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const percentage = totalVotes > 0 && votes > 0 ? (votes / totalVotes) * 100 : 0;
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    let animationFrame;
    const startTime = performance.now();
    const duration = (SHOW_RESULTS_DURATION - 1.5) * 1000;

    const animate = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayPercentage(progress * percentage);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayPercentage(percentage);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => { if (animationFrame) cancelAnimationFrame(animationFrame); };
  }, [percentage]);

  if (!userVotedAll) return null;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-1.5 w-full">
        <span
          style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color, fontWeight: 600, minWidth: 34, textAlign: 'right' }}
        >
          {Math.round(displayPercentage)}%
        </span>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${t.ink}25` }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${displayPercentage}%`, background: color, minWidth: 3 }}
          />
        </div>
      </div>

      {leadingMetrics?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-1 flex-wrap"
        >
          <Target size={11} style={{ color: t.mustard, flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: t.mustard, lineHeight: 1.3 }}>
            {leadingMetrics.map((m, i) => (
              <span key={m.metric_name}>
                {splitAndJoin(m.metric_name)}{i < leadingMetrics.length - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default VoteStats;
