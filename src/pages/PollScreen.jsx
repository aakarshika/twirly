import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useComparison } from '../contexts/ComparisonContext';
import { useHeader } from '../contexts/HeaderContext';
import PollGrid from '../components/comparison/PollGrid';
import BarChart from '../components/results/visualizations/BarChart';
import SetReviewModal from '../components/comparison/SetReviewModal';
import SetCombinedReviewModal from '../components/comparison/SetCombinedReviewModal';
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
        .select('*')
        .eq('set_id', currentSetId);

      if (error) throw error;

      // Fetch existing reviews for this user
      const { data: existingReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          item_id,
          review_metrics!inner (
            metric_name,
            value,
            set_id
          )
        `)
        .eq('user_id', user.id)
        .eq('review_metrics.set_id', currentSetId);

      if (reviewsError) throw reviewsError;

      // Initialize metrics with default values for each item and metric
      const defaultMetrics = {};
      const reviewIds = {};

      items.forEach(item => {
        defaultMetrics[item.id] = {};
        comparisonSetAspects.forEach(aspect => {
          defaultMetrics[item.id][aspect.metric_name] = 0;
        });

        // Check if this item has an existing review
        const existingReview = existingReviews?.find(review => review.item_id === item.id);
        if (existingReview) {
          reviewIds[item.id] = existingReview.id;
          // Set the metrics from the existing review
          existingReview.review_metrics.forEach(metric => {
            defaultMetrics[item.id][metric.metric_name] = metric.value;
          });
        }
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

  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentSetId || !user) return;
      
      try {
        setLoadingReviews(true);
        // Fetch all reviews for the set
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            item_id,
            user_id,
            review_metrics!inner (
              metric_name,
              value,
              set_id
            )
          `)
          .eq('review_metrics.set_id', currentSetId);

        if (reviewsError) throw reviewsError;

        // Check if user has reviewed all items
        const userReviews = reviews.filter(review => review.user_id === user.id);
        const userReviewedItems = new Set(userReviews.map(review => review.item_id));
        const allItemsReviewed = items.every(item => userReviewedItems.has(item.id));
        
        setHasReviewed(allItemsReviewed);

        // Group reviews by item_id
        const reviewsByItem = reviews.reduce((acc, review) => {
          if (!acc[review.item_id]) {
            acc[review.item_id] = {
              reviews: [],
              metrics: {}
            };
          }
          
          // Calculate average metrics for this item
          review.review_metrics.forEach(metric => {
            if (!acc[review.item_id].metrics[metric.metric_name]) {
              acc[review.item_id].metrics[metric.metric_name] = {
                total: 0,
                count: 0,
                average: 0
              };
            }
            acc[review.item_id].metrics[metric.metric_name].total += metric.value;
            acc[review.item_id].metrics[metric.metric_name].count += 1;
            acc[review.item_id].metrics[metric.metric_name].average = 
              acc[review.item_id].metrics[metric.metric_name].total / 
              acc[review.item_id].metrics[metric.metric_name].count;
          });

          acc[review.item_id].reviews.push(review);
          return acc;
        }, {});

        setItemReviews(reviewsByItem);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [currentSetId, items, user]);

  const handleItemClick = (item, position) => {
    if (userVoted) {
      setSelectedItem(item);
      setPopupPosition(position);
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedItem(null);
    setPopupPosition(null);
  };

  const handleNextPoll = () => {
    // TODO: Implement next poll logic
    handleClosePopup();
  };

  const handleReviewClick = (item) => {
    setActiveReviewItem(item.id);
  };

  console.log("items",items);
  console.log("id",id);
  console.log("currentComparisonName",currentComparisonName);
  console.log("currentComparisonDescription",currentComparisonDescription);
  console.log("currentSet",currentSet);
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
      top: isHeaderVisible ? '64px' : '0px',
    }}>
      
        <PollGrid 
          id={id}
          title={currentComparisonName}
          items={items}
          votedItemId={votedItemId}
          currentId={id}
          userVoted={userVoted}
          onItemClick={handleItemClick}
          itemReviews={itemReviews}
          setId={currentSetId}
          set={currentSet}
        />
      <div 
        className="relative z-0 w-full transition-all duration-150 ease-in-out"
        style={{ 
          backgroundColor: currentTheme.colors.background,
        }}
      >
        {userVoted && <div className="w-full max-w-4xl mx-auto">

          {/* Review Section */}
          <div className="w-full p-4">
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
          </div>
          <div className="w-full p-4" style={{ backgroundColor: 'white' }}>
            <div className="">
              <BarChart items={items} 
                      itemReviews={itemReviews} 
                      metrics={metrics} 
                      comparisonMetrics={comparisonMetrics}
                      setId={currentSetId}
                      set={currentSet}
                      />
            </div>
          </div>

        </div>}
      </div>
      {activeReviewItem && <SetReviewModal />}
      <SetCombinedReviewModal 
        comparisonMetrics={comparisonMetrics}
        existingReviewIds={existingReviewIds}
        loading={loading}
        metrics={metrics}
        setMetrics={setMetrics}
        fetchSetMetrics={fetchSetMetrics}
      />
    </div>
  );
};

export default PollScreen; 