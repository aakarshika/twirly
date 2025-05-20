import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useHeader } from '../../contexts/HeaderContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AspectsProgressBar from '../comparison-results-page/AspectsProgressBar';
import CompareAspectView from './CompareAspectView';
import { Navigate } from 'react-router-dom';
import CompareResultsView from './CompareResultsView';
import { Globe2, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';
import Trending from '../trending-page/Trending';
import { useComparisonDetails } from '../../hooks/useComparisonDetails';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';

const ComparePage = () => {
  const { id } = useParams();
  const currentSetId = parseInt(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTheme } = useTheme();
  const { isHeaderVisible, setIsHeaderVisible } = useHeader();
  const { user } = useAuth();
  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVotedAll, setUserVotedAll] = useState(false);
  const [initialNavigationDone, setInitialNavigationDone] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [celebratingAspectId, setCelebratingAspectId] = useState(null);
  const [currentAspect, setCurrentAspect] = useState(null);
  const trendingRef = useRef(null);
  
  const { items, currentSet } = useComparisonDetails(currentSetId);

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
        console.log('Intersection observer triggered:', entry.isIntersecting);
        if (entry.isIntersecting) {
          setShowTrending(true);
          observer.disconnect(); // Stop observing once loaded
        }
      },
      {
        root: null,
        rootMargin: '200px', // Increased margin to start loading earlier
        threshold: 0.1
      }
    );

    if (trendingRef.current) {
      console.log('Starting to observe trending section');
      observer.observe(trendingRef.current);
    }

    return () => {
      if (trendingRef.current) {
        observer.disconnect();
      }
    };
  }, [trendingRef.current]); // Added dependency to ensure observer is set up when ref is available

  // Update currentAspect when URL changes
  useEffect(() => {
    const aspectId = location.pathname.split('/').pop();
    if (aspectId && aspectId !== 'results') {
      const aspect = comparisonMetrics.find(metric => metric.id === parseInt(aspectId));
      if (aspect) {
        setCurrentAspect(aspect);
      }
    }
  }, [location.pathname, comparisonMetrics]);

  const fetchSetMetrics = async () => {
    if (!currentSetId || !user) return;
    
    try {
      // Fetch comparison aspects
      const { data: comparisonSetAspects, error } = await supabase
        .from('comparison_set_aspects')
        .select('*, votes(*)')
        .eq('set_id', currentSetId);

      if (error) throw error;

      // Process aspects to include user vote status
      const processedAspects = comparisonSetAspects.map(aspect => ({
        ...aspect,
        userVoted: aspect.votes.some(vote => vote.user_id === user.id)
      })).sort((a, b) => a.userVoted ? -1 : b.userVoted ? 1 : 0);

      setUserVotedAll(processedAspects.every(aspect => aspect.userVoted));
      setComparisonMetrics(processedAspects);
      setLoading(false);

      // Handle initial navigation
      if (!initialNavigationDone && location.pathname === `/compare/${currentSetId}`) {
        const firstUnvotedAspect = processedAspects.find(aspect => !aspect.userVoted);
        if (firstUnvotedAspect) {
          navigate(`/compare/${currentSetId}/aspect/${firstUnvotedAspect.id}`);
        } else {
          navigate(`/compare/${currentSetId}/results`);
        }
        setInitialNavigationDone(true);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle vote changes from CompareAspectView
  const handleVoteChange = (aspectId, hasVoted) => {
    console.log('ComparePage: handleVoteChange called with:', { aspectId, hasVoted });
    console.log('ComparePage: current comparisonMetrics:', comparisonMetrics);
    
    setComparisonMetrics(prevMetrics => {
      const updatedMetrics = prevMetrics.map(metric => 
        metric.id === parseInt(aspectId)
          ? { ...metric, userVoted: hasVoted }
          : metric
      );
      
      console.log('ComparePage: updated metrics:', updatedMetrics);
      
      // Update userVotedAll based on the updated metrics
      const allVoted = updatedMetrics.every(metric => metric.userVoted);
      console.log('ComparePage: allVoted:', allVoted);
      setUserVotedAll(allVoted);

      // Set celebrating aspect if vote was added
      if (hasVoted) {
        setCelebratingAspectId(parseInt(aspectId));
        // Start celebration timer
        setTimeout(() => {
          setCelebratingAspectId(null);
          
          const next = getNextUnvotedAspect();

          if (next) {
            setCurrentAspect(next);
            navigate(`/compare/${currentSetId}/aspect/${next.id}`);
          } else {
            setCurrentAspect(null);
            navigate(`/compare/${currentSetId}/results`);
          }
        }, SHOW_RESULTS_DURATION*1000);
      }
      
      return updatedMetrics;
    });
  };

  useEffect(() => {
    fetchSetMetrics();
  }, [currentSetId, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background ,
       paddingTop: isHeaderVisible ? '64px': '0px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background ,
        paddingTop: isHeaderVisible ? '64px': '0px'}}>
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

  const containerClasses = true
    ? 'w-full '
    : 'w-full mb-8 mt-4';

  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ 
        backgroundColor: currentTheme.colors.background
      }}
    >
      <div className="w-full bg-inherit">
        <div >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-white gap-4"
          >
            <AspectsProgressBar
              onNextClick={() => {
                const next = getNextUnvotedAspect();
                if (next) {
                  setCurrentAspect(next);
                  navigate(`/compare/${id}/aspect/${next.id}`);
                } else {
                  setCurrentAspect(null);
                  navigate(`/compare/${id}/results`);
                }
              }}
              comparisonMetrics={comparisonMetrics}
              onAspectClick={(aspect) => {
                if (aspect.id === 'results') {
                  setCurrentAspect(null);
                  navigate(`/compare/${id}/results`);
                } else if (aspect.id === 'explore') {
                  const trendingElement = document.getElementById('trending');
                  if (trendingElement) {
                    const trendingPosition = trendingElement.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                      top: trendingPosition - 200,
                      behavior: 'smooth'
                    });
                  }
                } else {
                  setCurrentAspect(aspect);
                  navigate(`/compare/${id}/aspect/${aspect.id}`);
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
      
      <div className="flex-grow" >
        {currentSet && (
          <div className="flex-grow">
            <Routes>
              <Route 
                path="aspect/:aspectId" 
                element={
                  <CompareAspectView 
                    onVoteChange={handleVoteChange}
                  />
                } 
              />
              <Route 
                path="results" 
                element={
                  <CompareResultsView 
                    items={items} 
                    currentSetId={currentSetId} 
                    currentSet={currentSet} 
                  />
                } 
              />
              <Route 
                path="/" 
                element={
                  <Navigate to={`/compare/${currentSetId}/results`} replace />
                } 
              />
            </Routes>
          </div>
        )}

        <div 
          className="relative z-0 w-full transition-all duration-150 ease-in-out"
          style={{ 
            backgroundColor: currentTheme.colors.background
          }}
        >
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div id="trending" className="flex h-full justify-start py-4">
            </div>
    
            <div className="flex justify-start py-4">
              <Globe2 size={24} className="mr-2" style={{ color: currentTheme.colors.primary }} />
              <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                Explore Similar
              </h1>
            </div>
            <div 
              ref={trendingRef} 
              className="min-h-[200px] w-full"
              style={{ visibility: showTrending ? 'visible' : 'hidden' }}
            >
              {showTrending && <Trending />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage; 