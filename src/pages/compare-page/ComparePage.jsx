import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
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

const ComparePage = () => {
  const { id } = useParams();
  const currentSetId = parseInt(id);
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { isHeaderVisible, setIsHeaderVisible } = useHeader();
  const { user } = useAuth();
  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVotedAll, setUserVotedAll] = useState(false);
  
  const { items, currentSet } = useComparisonDetails(currentSetId);

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
      
      return updatedMetrics;
    });
  };

  useEffect(() => {
    fetchSetMetrics();
  }, [currentSetId, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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

  const containerClasses = true
    ? 'w-full '
    : 'w-full mb-8 mt-4';

  return (
    <div className="min-h-screen flex flex-col" style={{  paddingTop: isHeaderVisible ? '64px' : '0px' }}>
      <div className="fixed top-0 left-0 right-0 z-10 bg-inherit">
        <div className={containerClasses} style={{ paddingTop: isHeaderVisible ? '100px' : '0px' }}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-white gap-4"
          >
            <AspectsProgressBar
              comparisonMetrics={comparisonMetrics}
              onAspectClick={(aspect) => {
                if (aspect.id === 'results') {
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
                  navigate(`/compare/${id}/aspect/${aspect.id}`);
                }
              }}
              userVotedAll={userVotedAll}
              currentSet={currentSet}
            />
          </motion.div>
        </div>
      </div>
      
      <div className="pt-[250px]">
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
                  <CompareResultsView 
                    items={items} 
                    currentSetId={currentSetId} 
                    currentSet={currentSet} 
                  />
                } 
              />
            </Routes>
          </div>
        )}

        <div 
          className="relative z-0 w-full transition-all duration-150 ease-in-out"
          style={{ 
            backgroundColor: currentTheme.colors.background,
          }}
        >
          <div className="w-full max-w-4xl mx-auto">
            <div id="trending" className="flex h-100 justify-start p-4">
            </div>
    
            <div className="flex justify-start p-4">
              <Globe2 size={24} className="mr-2" style={{ color: currentTheme.colors.primary }} />
              <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                Explore Similar
              </h1>
            </div>
            <Trending />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage; 