import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useHeader } from '../../contexts/HeaderContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AspectsProgressBar from '../comparison-results-page/AspectsProgressBar';
import CompareAspectView from './CompareAspectView';
import CompareResultsView from './CompareResultsView';
import { Globe2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Trending from '../trending-page/Trending';
import { useComparisonDetails } from '../../hooks/useComparisonDetails';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';

const ComparePage = () => {
  const { id } = useParams();
  const currentSetId = parseInt(id);
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const { user } = useAuth();
  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVotedAll, setUserVotedAll] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [celebratingAspectId, setCelebratingAspectId] = useState(null);
  const [currentAspect, setCurrentAspect] = useState(null);
  const [viewMode, setViewMode] = useState('aspect'); // 'aspect' or 'results'
  const trendingRef = useRef(null);
  const celebrationTimerRef = useRef(null);
  const navigate = useNavigate();
  
  const { items, currentSet, loading: comparisonLoading, error: comparisonError } = useComparisonDetails(currentSetId);

  const getNextUnvotedAspect = () => {
    if (!comparisonMetrics.length) return null;
    
    const currentIndex = currentAspect 
      ? comparisonMetrics.findIndex(metric => metric.id === currentAspect.id)
      : -1;
    
    // First try to find unvoted aspects from current position to end
    for (let i = currentIndex + 1; i < comparisonMetrics.length; i++) {
      if (!comparisonMetrics[i].userVoted) {
        return comparisonMetrics[i];
      }
    }
    
    // If no unvoted aspects found after current position, start from beginning
    for (let i = 0; i < currentIndex; i++) {
      if (!comparisonMetrics[i].userVoted) {
        return comparisonMetrics[i];
      }
    }
    
    return null; // Return null if all aspects are voted
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowTrending(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    if (trendingRef.current) {
      observer.observe(trendingRef.current);
    }

    return () => {
      if (trendingRef.current) {
        observer.disconnect();
      }
    };
  }, [trendingRef.current]);

  const fetchSetMetrics = async () => {
    if (!currentSetId || !user) {
      console.log('Missing required data:', { currentSetId, user });
      return;
    }
    
    try {
      console.log('Fetching set metrics for:', { currentSetId, user: user.id });
      
      // First fetch the aspects
      const { data: comparisonSetAspects, error: aspectsError } = await supabase
        .from('comparison_set_aspects')
        .select('*')
        .eq('set_id', currentSetId);

      if (aspectsError) throw aspectsError;
      if (!comparisonSetAspects || comparisonSetAspects.length === 0) {
        console.log('No aspects found for set:', currentSetId);
        setLoading(false);
        return;
      }

      // Then fetch all votes for these aspects
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .in('set_id', comparisonSetAspects.map(aspect => aspect.id));

      if (votesError) throw votesError;

      console.log('Fetched aspects:', comparisonSetAspects);
      console.log('Fetched votes:', votes);

      // Process aspects with their votes
      const processedAspects = comparisonSetAspects.map(aspect => {
        const aspectVotes = votes.filter(vote => vote.set_id === aspect.id);
        return {
          ...aspect,
          votes: aspectVotes,
          userVoted: aspectVotes.some(vote => vote.user_id === user.id),
          itemVoted: aspectVotes.find(vote => vote.user_id === user.id)?.item_id || -1
        };
      }).sort((a, b) => a.userVoted ? -1 : b.userVoted ? 1 : 0);

      console.log('Processed aspects:', processedAspects);
      setUserVotedAll(processedAspects.every(aspect => aspect.userVoted));
      setComparisonMetrics(processedAspects);
      setLoading(false);

      // Handle initial navigation
      const firstUnvotedAspect = processedAspects.find(aspect => !aspect.userVoted);
      if (firstUnvotedAspect) {
        console.log('Setting first unvoted aspect:', firstUnvotedAspect);
        setCurrentAspect(firstUnvotedAspect);
        setViewMode('aspect');
      } else {
        console.log('No unvoted aspects found, showing results');
        setCurrentAspect(null);
        setViewMode('results');
      }
    } catch (err) {
      console.error('Error in fetchSetMetrics:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Add effect to handle view mode changes
  useEffect(() => {
    if (!loading && !comparisonLoading && comparisonMetrics.length > 0) {
      const firstUnvotedAspect = comparisonMetrics.find(aspect => !aspect.userVoted);
      if (firstUnvotedAspect && !celebratingAspectId) {
        console.log('Setting first unvoted aspect from metrics:', firstUnvotedAspect);
        setCurrentAspect(firstUnvotedAspect);
        setViewMode('aspect');
      } else if (!firstUnvotedAspect && !celebratingAspectId) {
        console.log('No unvoted aspects found in metrics, showing results');
        setCurrentAspect(null);
        setViewMode('results');
      }
    }
  }, [loading, comparisonLoading, comparisonMetrics, celebratingAspectId]);

  // Add effect to handle aspect changes
  useEffect(() => {
    if (currentAspect) {
      console.log('Current aspect changed:', currentAspect);
      setViewMode('aspect');
    }
  }, [currentAspect]);

  const handleVoteChange = (aspectId, hasVoted, item_id) => {
    console.log('handleVoteChange', aspectId, hasVoted, item_id);
    console.log('celebratingAspectId', celebratingAspectId);

    if (celebrationTimerRef.current) {
      clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = null;
    }
    
    setComparisonMetrics(prevMetrics => {
      const updatedMetrics = prevMetrics.map(metric => 
        metric.id === parseInt(aspectId)
          ? { ...metric, userVoted: hasVoted, itemVoted: hasVoted ? item_id : -1 }
          : metric
      );
      
      const allVoted = updatedMetrics.every(metric => metric.userVoted);
      setUserVotedAll(allVoted);

      if (hasVoted) {
        setCelebratingAspectId(parseInt(aspectId));
        // Start celebration timer
        celebrationTimerRef.current = setTimeout(() => {
          setCelebratingAspectId(null);
          celebrationTimerRef.current = null;
          
          // Only move to next aspect after celebration is done
          const next = getNextUnvotedAspect();
          if (next) {
            setCurrentAspect(next);
            setViewMode('aspect');
          } else {
            setCurrentAspect(null);
            setViewMode('results');
          }
        }, SHOW_RESULTS_DURATION * 1000);
      }
      
      return updatedMetrics;
    });
  };

  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
        celebrationTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
        celebrationTimerRef.current = null;
        setCelebratingAspectId(null);
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('scroll', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    fetchSetMetrics();
  }, [currentSetId, user, items, currentSet]);

  if (loading || comparisonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background,
       paddingTop: isHeaderVisible ? '64px': '0px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || comparisonError) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background,
        paddingTop: isHeaderVisible ? '64px': '0px'}}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || comparisonError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ 
        backgroundColor: currentTheme.colors.background
      }}
    >
      <div className="w-full bg-inherit">
        <div>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-white gap-4"
          >
            <AspectsProgressBar
              items={items}
              comparisonMetrics={comparisonMetrics}
              onAspectClick={(aspect) => {
                if (aspect.id === 'results') {
                  setCurrentAspect(null);
                  setViewMode('results');
                } else {
                  setCurrentAspect(aspect);
                  setViewMode('aspect');
                }
              }}
              userVotedAll={userVotedAll}
              currentSet={currentSet}
              celebratingAspectId={celebratingAspectId}
              currentAspect={currentAspect}
            />
          </motion.div>
        </div>
      </div>
      
      <div className="flex-grow">
        {currentSet && (
          <div className="flex-grow">
            {viewMode === 'aspect' && currentAspect && (
              <CompareAspectView 
                onVoteChange={handleVoteChange}
                onNextClick={() => {
                  const next = getNextUnvotedAspect();
                  if (next) {
                    setCurrentAspect(next);
                    setViewMode('aspect');
                  } else {
                    setCurrentAspect(null);
                    setViewMode('results');
                  }
                }}
                celebratingAspectId={celebratingAspectId}
                isResultsPage={false}
                currentAspect={currentAspect}
                nextUnvotedAspect={getNextUnvotedAspect()}
              />
            )}
            {viewMode === 'results' && (
              <CompareResultsView 
                items={items} 
                currentSetId={currentSetId} 
                currentSet={currentSet} 
              />
            )}
          </div>
        )}

        {!currentAspect && viewMode === 'results' && (
          <div 
            className="relative z-0 w-full transition-all duration-150 ease-in-out"
            style={{ 
              backgroundColor: currentTheme.colors.background
            }}
          >
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <div className="flex justify-start py-4">
                <Globe2 size={24} className="mr-2" style={{ color: currentTheme.colors.primary }} />
                <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                  Explore Similar
                </h1>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;