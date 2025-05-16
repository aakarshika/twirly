import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useHeader } from '../../contexts/HeaderContext';
import BarChart from './comparison-sections/BarChart';
import { useComparisonDetails } from '../../hooks/useComparisonDetails';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ComparisonGridSkeleton from '../../components/skeletons/ComparisonGridSkeleton';
import ComparisonCirclesView from './ComparisonCirclesView';
import Trending from '../trending-page/Trending';
import { Globe2, TrendingUp } from 'lucide-react';

const PollScreen = ({items, currentSetId, currentSet}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  console.log('items', items);
  console.log('currentSetId idddddddddddd', currentSetId);
  console.log('currentSet', currentSet);
  
  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [userVotedAll, setUserVotedAll] = useState(false);
  const fetchSetMetrics = async () => {
    if (!currentSetId || !user) return;
    
    try {
      // Fetch comparison aspects
      const { data: comparisonSetAspects, error } = await supabase
        .from('comparison_set_aspects')
        .select('*, votes(*)')
        .eq('set_id', currentSetId);

      if (error) throw error;

      comparisonSetAspects.forEach(aspect => {
        // calculate userVoted from votes
        const userVoted = aspect.votes.filter(vote => vote.user_id === user.id).length > 0;
        aspect.userVoted = userVoted;
      });
      setUserVotedAll(comparisonSetAspects.every(aspect => aspect.userVoted));
      setComparisonMetrics(comparisonSetAspects);
    } catch (err) {
      console.error('Error fetching comparison metrics:', err);
    } finally {
    }
  };

  useEffect(() => {
    fetchSetMetrics();
  }, [currentSetId, items, user]);


  return (
    
    <div className="min-h-screen h-full flex flex-col max-w-4xl mx-auto"
    
    style={{ 
      backgroundColor: currentTheme.colors.background
    }}>
          {items && items.length > 0 && (<ComparisonCirclesView 
            items={items} 
            comparisonMetrics={comparisonMetrics}
            comparison={currentSet}
            userVotedAll={userVotedAll}
          />)}
      
      {userVotedAll && items && items.length > 0 && (<div 
        className="relative z-0 w-full transition-all duration-150 ease-in-out"
        style={{ 
          backgroundColor: currentTheme.colors.background,
        }}
      >
        <div className="w-full max-w-4xl mx-auto">

          <div className="w-full p-1" style={{ backgroundColor: 'white', marginBottom: '100px' }}>
            <div className="">
              <BarChart items={items} 
                      comparisonMetrics={comparisonMetrics}
                      />
            </div>
          </div>

        </div>
      </div>)}
      
    </div>
  );
};

export default PollScreen; 