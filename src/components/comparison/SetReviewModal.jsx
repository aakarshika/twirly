import React, { useState, useEffect } from 'react';
import { useComparison } from '../../contexts/ComparisonContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';
import { Star, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SetReviewModal = () => {
  const { 
    items,
    currentSetId,
    setActiveReviewItem,
    activeReviewItem
  } = useComparison();

  const { user } = useAuth();
  const { currentTheme } = useTheme();
  
  const [reviewText, setReviewText] = useState('');
  const [reviewId, setReviewId] = useState(-1);
  const [metrics, setMetrics] = useState({});
  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const item = items.find(item => item.id === activeReviewItem);
  const maxChars = 500;
  const charCount = reviewText.length;

  useEffect(() => {
    const fetchSetMetrics = async () => {
      if (!currentSetId) return;
      
      try {
        const { data: comparisonSetAspects, error } = await supabase
          .from('comparison_set_aspects')
          .select('*')
          .eq('set_id', currentSetId);

        if (error) throw error;


        const { data, error: reviewError } = await supabase
          .from('reviews')
          .select('*, review_metrics!inner(*)')
          .eq('item_id', item.id)
          .eq('review_metrics.set_id', currentSetId);

        if (reviewError) throw reviewError;

        const metricsArray = [];
        comparisonSetAspects.forEach(aspect => {
          metricsArray.push({
            metric_name: aspect.metric_name,
            value: data && data.length > 0 ? data[0].review_metrics.find(metric => metric.metric_name === aspect.metric_name)?.value || 0 : 0
          });
        });
        console.log(metricsArray);
        setComparisonMetrics(metricsArray);
        setReviewText( data && data.length > 0 ? data[0].text : '');
        setReviewId(data && data.length > 0 ? data[0].id : -1);
        // Initialize metrics with default values
        const defaultMetrics = metricsArray.reduce((acc, metric) => {
          acc[metric.metric_name] = metric.value || 0;
          return acc;
        }, {});
        console.log(defaultMetrics);
        setMetrics(defaultMetrics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSetMetrics();
  }, [currentSetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !currentSetId) {
      console.error('User must be logged in and set ID must be present');
      return;
    }

    try {
      let reviewData;
      
      if (reviewId === -1) {
        // Create new review
        const { data: newReviewData, error: reviewError } = await supabase
          .from('reviews')
          .insert([
            {
              user_id: user.id,
              item_id: item.id,
              text: reviewText,
              likes: 0,
            }
          ])
          .select()
          .single();

        if (reviewError) throw reviewError;
        reviewData = newReviewData;
      } else {
        // Update existing review
        const { data: updatedReviewData, error: reviewError } = await supabase
          .from('reviews')
          .update({ text: reviewText })
          .eq('id', reviewId)
          .select()
          .single();

        if (reviewError) throw reviewError;
        reviewData = updatedReviewData;
      }

      // Delete existing metrics if updating
      if (reviewId !== -1) {
        const { error: deleteError } = await supabase
          .from('review_metrics')
          .delete()
          .eq('review_id', reviewId);

        if (deleteError) throw deleteError;
      }

      // Insert the review metrics
      const metricsToInsert = Object.entries(metrics).map(([metricName, value]) => ({
        review_id: reviewData.id,
        set_id: currentSetId,
        metric_name: metricName,
        value: value,
      }));

      const { error: metricsError } = await supabase
        .from('review_metrics')
        .insert(metricsToInsert);

      if (metricsError) throw metricsError;

      // Reset form and close modal
      setReviewText('');
      setReviewId(-1);
      setMetrics({});
      setActiveReviewItem(null);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message);
    }
  };

  const renderStars = (metricName, value) => {
    return [1, 2, 3].map((star) => (
      <button
        key={star}
        type="button"
        className={`p-1 rounded-full transition-colors ${
          star <= value
            ? 'text-amber-400'
            : 'text-gray-600'
        }`}
        onClick={() => {
          console.log(metrics);
          setMetrics({ ...metrics, [metricName]: star })}}
      >
        <Star size={24} className={star <= value ? 'fill-current' : ''} />
      </button>
    ));
  };

  if (!item || loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }}>
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => setActiveReviewItem(null)}
      />
      
      <div 
        className="relative w-full max-w-2xl bg-gray-900 rounded-lg p-6"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white" style={{ color: currentTheme.colors.text }}>Review {item.name}</h2>
          <button
            onClick={() => setActiveReviewItem(null)}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" style={{ color: currentTheme.colors.text }}>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200" style={{ color: currentTheme.colors.text }}>Rate the following aspects:</h3>
            <div className="space-y-6">
              {Object.entries(metrics).map(([metricName, value]) => (
                <div 
                  key={metricName} 
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 capitalize" style={{ color: currentTheme.colors.text }}>{metricName}</span>
                  </div>
                  <div className="flex gap-1">
                    {renderStars(metricName, value || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setActiveReviewItem(null)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={Object.keys(metrics).length === 0}
              className="px-6"
            >
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetReviewModal; 