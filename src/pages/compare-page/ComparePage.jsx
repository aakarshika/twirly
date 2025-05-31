import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useHeader } from '../../contexts/HeaderContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AspectsProgressBar from '../comparison-results-page/AspectsProgressBar';
import CompareAspectView from './CompareAspectView';
import CompareResultsView from './CompareResultsView';
import ExploreSimilar from './ExploreSimilar';
import { Globe2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Trending from '../trending-page/Trending';
import { useComparisonDetails } from '../../hooks/useComparisonDetails';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';
import PullToRefresh from '../../components/common/PullToRefresh';
import BackgroundImage from '../../components/common/BackgroundImage';
import ComparePageSkeleton from '../../components/skeletons/ComparePageSkeleton';

const ComparePage = () => {
  const { id } = useParams();
  const currentSetId = parseInt(id);
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const { user } = useAuth();
  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [error, setError] = useState(null);
  const [userVotedAll, setUserVotedAll] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [celebratingAspectId, setCelebratingAspectId] = useState(null);
  const [currentAspect, setCurrentAspect] = useState(null);
  const [viewMode, setViewMode] = useState('aspect'); // 'aspect' or 'results'
  const trendingRef = useRef(null);
  const celebrationTimerRef = useRef(null);
  const navigate = useNavigate();
  const [celebratingResults, setCelebratingResults] = useState(false);
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

      // Process aspects even if there are none
      const processedAspects = (comparisonSetAspects || []).map(aspect => ({
        ...aspect,
        votes: [],
        userVoted: false,
        itemVoted: -1
      }));

      // If there are aspects, fetch their votes
      if (processedAspects.length > 0) {
        const { data: votes, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .in('set_id', processedAspects.map(aspect => aspect.id));

        if (votesError) throw votesError;

        // Update aspects with vote information
        processedAspects.forEach(aspect => {
          const aspectVotes = votes.filter(vote => vote.set_id === aspect.id);
          aspect.votes = aspectVotes;
          aspect.userVoted = aspectVotes.some(vote => vote.user_id === user.id);
          aspect.itemVoted = aspectVotes.find(vote => vote.user_id === user.id)?.item_id || -1;
        });
      }

      console.log('Processed aspects:', processedAspects);
      setUserVotedAll(processedAspects.every(aspect => aspect.userVoted));
      setComparisonMetrics(processedAspects);

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
    }
  };

  const moveToNextAspect = () => {
    const next = getNextUnvotedAspect();
    if (next) {
      setCurrentAspect(next);
      setViewMode('aspect');
    } else {
      setCurrentAspect(null);
      setCelebratingResults(true);
      setViewMode('results');
      setTimeout(() => {
        setCelebratingResults(false);
      }, SHOW_RESULTS_DURATION * 1000);
    }
  };

  const handleVoteChange = (aspectId, hasVoted, item_id) => {
    console.log('handleVoteChange', aspectId, hasVoted, item_id);
    
    // Clear any existing celebration
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
          moveToNextAspect();
        }, SHOW_RESULTS_DURATION * 1000);
      }
      
      return updatedMetrics;
    });
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
        celebrationTimerRef.current = null;
        setCelebratingAspectId(null);
      }
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    scrollTo(0, 0);
    fetchSetMetrics();
  }, [currentSetId, user]);

  const handleRefresh = async () => {
    await fetchSetMetrics();
  };

  // Show skeleton during loading
  if (comparisonLoading ) {
    return <ComparePageSkeleton />;
  }

  // Show error state if either error exists
  if (error || comparisonError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error || comparisonError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen max-w-7xl mx-auto overflow-x-hidden">
        <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:py-4"></div>
          <div className="">
            <div className="w-full">
              <motion.div
                className="text-white"
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
          
          <div className="flex-grow md:px-60 lg:px-60">
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
                    celebratingResults={celebratingResults}
                  />
                )}
              </div>
            )}

            {!currentAspect && viewMode === 'results' && (
              <div className="relative w-full transition-all duration-150 ease-in-out">
                <div className="w-full max-w-7xl mx-auto lg:px-8">
                  <div className="flex justify-start py-4">
                    <Globe2 size={24} className="mr-2" style={{ color: currentTheme.colors.primary }} />
                    <h1 className="text-xl sm:text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                      Explore Similar
                    </h1>
                  </div>
                  <ExploreSimilar currentSetId={currentSetId} />
                </div>
              </div>
            )}
          </div>
          {showTrending && (
            <div ref={trendingRef}>
              <Trending />
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

export default ComparePage;