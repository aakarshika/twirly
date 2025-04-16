import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useComparison } from '../contexts/ComparisonContext';
import { useHeader } from '../contexts/HeaderContext';
import PollGrid from '../components/comparison/PollGrid';
import BarChart from '../components/results/visualizations/BarChart';
import ComparisonSetCommentsSection from '../components/comparison/ComparisonSetCommentsSection';
import SetReviewModal from '../components/comparison/SetReviewModal';
import { useComparisonDetails } from '../hooks/useComparisonDetails';
import Button from '../components/common/Button';
import { MessageSquare, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PollScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    items, 
    userVoted, 
    votedItemId, 
    currentSetId,
    currentComparisonName,
    handleVote,
    setActiveReviewItem,
    activeReviewItem
  } = useComparison();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const { loading, error } = useComparisonDetails(id);
  
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [itemReviews, setItemReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentSetId) return;
      
      try {
        setLoadingReviews(true);
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            item_id,
            text,
            review_metrics (
              metric_name,
              value
            )
          `)
          .eq('set_id', currentSetId);

        if (reviewsError) throw reviewsError;

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
  }, [currentSetId]);

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
  useEffect(() => {
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
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
    <div className="min-h-screen relative" style={{ backgroundColor: currentTheme.colors.background }}>
      <PollGrid 
        title={currentComparisonName}
        items={items}
        votedItemId={votedItemId}
        currentId={id}
        userVoted={userVoted}
        onItemClick={handleItemClick}
      />

      <div 
        className="relative z-0 w-full transition-all duration-150 ease-in-out"
        style={{ 
          marginTop: '100vh',
          minHeight: '100vh',
          backgroundColor: currentTheme.colors.background,
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        <div className="w-full max-w-4xl mx-auto">
          <div className="w-full p-4">
            <div className="bg-gray-800 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
              <BarChart items={items} />
            </div>
          </div>

          <div className="w-full p-4">
            <ComparisonSetCommentsSection setId={currentSetId} items={items} />
          </div>

          {/* Review Section */}
          <div className="w-full p-4">
            <div className="bg-gray-800 rounded-lg p-6" style={{ backgroundColor: currentTheme.colors.background }}>
              <h3 className="text-xl font-semibold text-white mb-4">Review Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const itemReviewData = itemReviews[item.id] || { reviews: [], metrics: {} };
                  const reviewCount = itemReviewData.reviews.length;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex flex-col p-4 bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image_url || '/api/placeholder/300/300'} 
                            alt={item.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <span className="text-white">{item.name}</span>
                        </div>
                        <Button
                          onClick={() => handleReviewClick(item)}
                          className="flex items-center gap-2"
                        >
                          <MessageSquare size={16} />
                          Add Review
                        </Button>
                      </div>
                      
                      {reviewCount > 0 && (
                        <div className="mt-2">
                          <div className="text-sm text-gray-400 mb-2">
                            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                          </div>
                          <div className="space-y-2">
                            {Object.entries(itemReviewData.metrics).map(([metricName, metricData]) => (
                              <div key={metricName} className="flex items-center justify-between">
                                <span className="text-gray-300 text-sm">{metricName}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-amber-400 text-sm">
                                    {metricData.average.toFixed(1)}
                                  </span>
                                  <Star size={14} className="text-amber-400" fill="currentColor" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeReviewItem && <SetReviewModal />}
    </div>
  );
};

export default PollScreen; 