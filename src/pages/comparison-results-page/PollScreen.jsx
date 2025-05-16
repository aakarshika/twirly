import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { useHeader } from '../../contexts/HeaderContext';
import BarChart from './comparison-sections/BarChart';
import { useComparisonDetails } from '../../hooks/useComparisonDetails';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ComparisonGridSkeleton from '../../components/skeletons/ComparisonGridSkeleton';
import ComparisonCirclesView from './ComparisonCirclesView';
import Trending from '../trending-page/Trending';
import { Globe2, TrendingUp } from 'lucide-react';

const PollScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    items, 
    currentSetId,
    currentSet,
    setActiveReviewItem,
  } = useComparison();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const { loading, error } = useComparisonDetails(id);
  
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
      setError(err.message);
    } finally {
    }
  };

  useEffect(() => {
    fetchSetMetrics();
  }, [currentSetId, items, user]);



  const handleNextPoll = () => {
    // TODO: Implement next poll logic
    handleClosePopup();
  };

  const handleReviewClick = (item) => {
    setActiveReviewItem(item.id);
  };

  useEffect(() => {
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src="/public_logo_transparent.png" alt="logo" className="h-100 w-100 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen h-full flex flex-col max-w-4xl mx-auto"
    
    style={{ 
      backgroundColor: currentTheme.colors.background,
        position: 'relative',
        top: isHeaderVisible ? '64px' : '0px',
    }}>
          <ComparisonCirclesView 
            items={items} 
            comparisonMetrics={comparisonMetrics}
            comparison={currentSet}
            userVotedAll={userVotedAll}
          />
      
      {userVotedAll && (<div 
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
      {userVotedAll && (
        <div 
        className="relative z-0 w-full transition-all duration-150 ease-in-out"
        style={{ 
          backgroundColor: currentTheme.colors.background,
        }}
      >
        <div className="w-full max-w-4xl mx-auto">
  
        <div className="flex justify-start p-4" style={{ marginTop: true ? '64px' : '0px' }}>
          <Globe2 size={24} className="mr-2" style={{ color: currentTheme.colors.primary }} />
          <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
            Explore Similar
          </h1>
        </div>
          <Trending />
        </div>
      </div>)}
      
    </div>
  );
};

export default PollScreen; 