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
  const { isHeaderVisible } = useHeader();
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

      comparisonSetAspects.forEach(aspect => {
        const userVoted = aspect.votes.filter(vote => vote.user_id === user.id).length > 0;
        aspect.userVoted = userVoted;
      });
      setUserVotedAll(comparisonSetAspects.every(aspect => aspect.userVoted));
      setComparisonMetrics(comparisonSetAspects);
      setLoading(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background, paddingTop : isHeaderVisible ? '64px' : '0px' }}>
      <div className="sticky top-0 z-50" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="">
          
        <div className={containerClasses}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gradient-to-b from-amber-300 to-white-600 text-white gap-4"
          >

        {userVotedAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center space-x-3 m-2 p-4"
              >
                <PartyPopper className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-center">The Results Are In!</h2>
                <PartyPopper className="w-6 h-6 text-amber-500" />
              </motion.div>
            )}
            {!userVotedAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center space-x-3 m-2 p-4"
              >
                <h2 className="text-lg font-bold text-center">Keep voting to reveal results</h2>
              </motion.div>
            )}
        <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col items-center justify-center text-amber-500 space-x-2 bg-amber-100 rounded-lg m-2 p-2"
            >
              <div className='flex flex-row items-center'>
                <h4 className='text-sm'>{currentSet?.name}</h4>
              </div>
            </motion.div>
          <AspectsProgressBar
            comparisonMetrics={comparisonMetrics}
            onAspectClick={(aspect) => {
              if (aspect.id === 'results') {
                navigate(`/compare/${id}/results`);
              } else {
                navigate(`/compare/${id}/aspect/${aspect.id}`);
              }
            }}
          />
          </motion.div>
          </div>
        </div>
      </div>
      
      {currentSet && (<div className="flex-grow">
        <Routes>
          <Route path="aspect/:aspectId" element={<CompareAspectView items={items} currentSetId={currentSetId} currentSet={currentSet} />} />
          <Route path="results" element={<CompareResultsView items={items} currentSetId={currentSetId} currentSet={currentSet} />} />
          <Route path="/" element={<CompareResultsView items={items} currentSetId={currentSetId} currentSet={currentSet} />} />
        </Routes>
      </div>)}

      {(
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

export default ComparePage; 