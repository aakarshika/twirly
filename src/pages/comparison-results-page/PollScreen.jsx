import React, { useState, useEffect } from 'react';
import BarChart from './comparison-sections/BarChart';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import ComparisonCirclesView from './ComparisonCirclesView';

const PollScreen = ({ items, currentSetId, currentSet, celebratingResults }) => {
  const { user } = useAuth();

  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [userVotedAll, setUserVotedAll] = useState(false);
  const [processedItems, setProcessedItems] = useState([]);

  const fetchSetMetrics = async () => {
    if (!currentSetId || !user) return;

    try {
      const { data: resp } = await apiClient.get(`/api/sets/${currentSetId}/aspects`);
      const comparisonSetAspects = resp.data ?? [];

      const totalVotesAcrossAspects = comparisonSetAspects.reduce(
        (total, aspect) => total + (aspect.total_votes ?? 0), 0,
      );

      const itemsWithVotes = items.map(item => {
        const itemVotes = comparisonSetAspects.reduce((total, aspect) => {
          const aspectVotesList = Array.isArray(aspect.votes) ? aspect.votes : [];
          return total + aspectVotesList.filter(v => v.item_id === item.id).length;
        }, 0);
        return { ...item, voteCount: itemVotes };
      });

      const processedAspects = comparisonSetAspects.map(aspect => ({
        ...aspect,
        userVoted: aspect.user_voted ?? false,
        totalVotes: totalVotesAcrossAspects,
      }));

      setUserVotedAll(processedAspects.every(a => a.userVoted));
      setComparisonMetrics(processedAspects);
      setProcessedItems(itemsWithVotes);
    } catch (err) {
      console.error('Error fetching comparison metrics:', err);
    }
  };

  useEffect(() => {
    fetchSetMetrics();
  }, [currentSetId, user]);

  return (
    <div
      className="min-h-screen w-full flex flex-col"
    >
      <div className="">
        {processedItems && processedItems.length > 0 && (
          <div className="w-full flex flex-col items-center">
            <ComparisonCirclesView
              items={processedItems}
              comparisonMetrics={comparisonMetrics}
              comparison={currentSet}
              userVotedAll={userVotedAll}
              celebratingResults={celebratingResults}
            />
          </div>
        )}

        {userVotedAll && processedItems && processedItems.length > 0 && (
          <div className="w-full">
            <div className="w-full">
              <BarChart
                items={processedItems}
                comparisonMetrics={comparisonMetrics}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollScreen;
