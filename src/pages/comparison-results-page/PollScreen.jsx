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

  const fetchSetMetrics = async () => {
    if (!currentSetId || !user) return;
    
    try {
      const { data: comparisonSetAspects, error } = await supabase
        .from('comparison_set_aspects')
        .select('*, votes(*)')
        .eq('set_id', currentSetId);

      if (error) throw error;

      const processedAspects = comparisonSetAspects.map(aspect => ({
        ...aspect,
        userVoted: aspect.votes.some(vote => vote.user_id === user.id)
      }));

      setUserVotedAll(processedAspects.every(aspect => aspect.userVoted));
      setComparisonMetrics(processedAspects);
    } catch (err) {
      console.error('Error fetching comparison metrics:', err);
    }
  };

  useEffect(() => {
    fetchSetMetrics();
  }, [currentSetId, user]);

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{ 
        backgroundColor: currentTheme.colors.background
      }}
    >
      <div className="w-full max-w-4xl">
        {items && items.length > 0 && (
          <div className="w-full flex flex-col items-center">
            <ComparisonCirclesView 
              items={items} 
              comparisonMetrics={comparisonMetrics}
              comparison={currentSet}
              userVotedAll={userVotedAll}
            />
          </div>
        )}
        
        {userVotedAll && items && items.length > 0 && (
          <div className="w-full mt-8">
            <div className="w-full bg-white rounded-lg shadow-sm p-6">
              <BarChart 
                items={items} 
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