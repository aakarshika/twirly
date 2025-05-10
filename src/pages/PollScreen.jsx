import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useComparison } from '../contexts/ComparisonContext';
import { useHeader } from '../contexts/HeaderContext';
import PollGrid from '../components/comparison/PollGrid';
import BarChart from '../components/results/visualizations/BarChart';
import { useComparisonDetails } from '../hooks/useComparisonDetails';
import Button from '../components/common/Button';
import { MessageSquare, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ComparisonGridSkeleton from '../components/skeletons/ComparisonGridSkeleton';

const PollScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    items, 
    userVoted, 
    votedItemId, 
    currentSetId,
    currentComparisonName,
    currentComparisonDescription,
    currentSet,
    handleVote,
    setActiveReviewItem,
    activeReviewItem,
    setShowCombinedReviewModal,
  } = useComparison();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const { loading, error } = useComparisonDetails(id);
  
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [itemReviews, setItemReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);

  const [metrics, setMetrics] = useState({});
  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [existingReviewIds, setExistingReviewIds] = useState({});

  const fetchSetMetrics = async () => {
    if (!currentSetId || !user) return;
    
    try {
      // Fetch comparison aspects
      const { data: comparisonSetAspects, error } = await supabase
        .from('comparison_set_aspects')
        .select('*, votes(*)')
        .eq('set_id', currentSetId);

      if (error) throw error;

      // Initialize metrics with default values for each item and metric
      const defaultMetrics = {};
      const reviewIds = {};

      items.forEach(item => {
        defaultMetrics[item.id] = {};
        comparisonSetAspects.forEach(aspect => {
          defaultMetrics[item.id][aspect.metric_name] = 0;
        });

      });

      setMetrics(defaultMetrics);
      setComparisonMetrics(comparisonSetAspects);
      setExistingReviewIds(reviewIds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingReviews(false);
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
      
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
          <ComparisonGridSkeleton />
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
      
        <PollGrid 
          id={id}
          title={currentComparisonName}
          items={items}
          votedItemId={votedItemId}
          currentId={id}
          itemReviews={itemReviews}
          setId={currentSetId}
          set={currentSet}
          metrics={metrics} 
          comparisonMetrics={comparisonMetrics}
        />
      <div 
        className="relative z-0 w-full transition-all duration-150 ease-in-out"
        style={{ 
          backgroundColor: currentTheme.colors.background,
        }}
      >
        <div className="w-full max-w-4xl mx-auto">

          {/* Review Section */}
          {/* <div className="w-full p-4">
            <div className="bg-gray-800 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => setShowCombinedReviewModal(true)}
                  className="flex items-center gap-2"
                >
                  <Star size={16} />
                  {hasReviewed ? 'Edit Combined Review' : 'Add Combined Review'}
                </Button>
              </div>
            </div>
          </div> */}
          <div className="w-full p-1" style={{ backgroundColor: 'white', marginBottom: '100px' }}>
            <div className="">
              <BarChart items={items} 
                      itemReviews={itemReviews} 
                      metrics={metrics} 
                      comparisonMetrics={comparisonMetrics}
                      />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PollScreen; 