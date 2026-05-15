import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getSetAspects } from '../../services/comparisons';
import ComparisonCirclesView from './ComparisonCirclesView';
import BarChart from './comparison-sections/BarChart';

const PollScreen = ({ items, currentSetId, currentSet, celebratingResults }) => {
  const { user } = useAuth();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [userVotedAll, setUserVotedAll] = useState(false);
  const [processedItems, setProcessedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSetMetrics = async () => {
      if (!currentSetId || !user) return;
      try {
        setLoading(true);
        const aspects = await getSetAspects(currentSetId);

        const itemsWithVotes = items.map(item => ({
          ...item,
          voteCount: aspects.reduce((total, aspect) => {
            const votes = Array.isArray(aspect.votes) ? aspect.votes : [];
            return total + votes.filter(v => v.item_id === item.id).length;
          }, 0),
        }));

        const totalVotesAcrossAspects = aspects.reduce(
          (sum, a) => sum + (a.total_votes ?? 0), 0,
        );

        const processedAspects = aspects.map(aspect => ({
          ...aspect,
          userVoted: aspect.user_voted ?? false,
          totalVotes: totalVotesAcrossAspects,
        }));

        setUserVotedAll(processedAspects.every(a => a.userVoted));
        setComparisonMetrics(processedAspects);
        setProcessedItems(itemsWithVotes);
      } catch (err) {
        console.error('Error fetching comparison metrics:', err);
        setError(err.message ?? 'failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchSetMetrics();
  }, [currentSetId, user]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 p-3">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="rounded-sm"
            style={{ aspectRatio: '1/1', background: t.bgDeep }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm p-6 m-4" style={{ background: t.bgDeep, border: `1px solid ${t.red}40` }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20, color: t.red, lineHeight: 1.1 }}>
          results unavailable.
        </h2>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: `${t.ink}70`, marginTop: 8 }}>
          {error}
        </p>
      </div>
    );
  }

  if (!processedItems.length) return null;

  return (
    <div className="w-full flex flex-col">
      <ComparisonCirclesView
        items={processedItems}
        comparisonMetrics={comparisonMetrics}
        comparison={currentSet}
        userVotedAll={userVotedAll}
        celebratingResults={celebratingResults}
      />

      {userVotedAll && (
        <BarChart items={processedItems} comparisonMetrics={comparisonMetrics} />
      )}
    </div>
  );
};

export default PollScreen;
