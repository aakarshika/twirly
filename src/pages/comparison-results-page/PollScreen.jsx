import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useHeader } from '../../contexts/HeaderContext';
import BarChart from './comparison-sections/BarChart';
import { useComparisonDetails } from '../../hooks/useComparisonDetails';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ComparisonCirclesView from './ComparisonCirclesView';
import Trending from '../trending-page/Trending';
import { Globe2, TrendingUp } from 'lucide-react';

const PollScreen = ({items, currentSetId, currentSet}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  
  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [userVotedAll, setUserVotedAll] = useState(false);
  const [processedItems, setProcessedItems] = useState([]);

  const fetchSetMetrics = async () => {
    if (!currentSetId || !user) return;
    
    try {
      const { data: comparisonSetAspects, error } = await supabase
        .from('comparison_set_aspects')
        .select('*, votes(*)')
        .eq('set_id', currentSetId);

      if (error) throw error;

      // Calculate total votes across all aspects
      const totalVotesAcrossAspects = comparisonSetAspects.reduce((total, aspect) => total + aspect.votes.length, 0);

      // Process items with their total votes across all aspects
      const itemsWithVotes = items.map(item => {
        const itemVotes = comparisonSetAspects.reduce((total, aspect) => {
          const aspectVotesForItem = aspect.votes.filter(vote => vote.item_id === item.id).length;
          return total + aspectVotesForItem;
        }, 0);
        
        return {
          ...item,
          voteCount: itemVotes
        };
      });

      const processedAspects = comparisonSetAspects.map(aspect => ({
        ...aspect,
        userVoted: aspect.votes.some(vote => vote.user_id === user.id),
        totalVotes: totalVotesAcrossAspects
      }));

      setUserVotedAll(processedAspects.every(aspect => aspect.userVoted));
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
      style={{ 
        backgroundColor: currentTheme.colors.background
      }}
    >
      <div className="w-full max-w-4xl">
        {processedItems && processedItems.length > 0 && (
          <div className="w-full flex flex-col items-center">
            <ComparisonCirclesView 
              items={processedItems} 
              comparisonMetrics={comparisonMetrics}
              comparison={currentSet}
              userVotedAll={userVotedAll}
            />
          </div>
        )}
        
        {userVotedAll && processedItems && processedItems.length > 0 && (
          <div className="w-full">
            <div className="w-full bg-white shadow-sm">
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