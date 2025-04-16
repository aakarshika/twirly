import React, { useState, useEffect } from 'react';
import { useComparison } from '../../contexts/ComparisonContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';
import { Star, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SetCombinedReviewModal = ({ existingReviewIds, loading, comparisonMetrics, metrics, setMetrics , fetchSetMetrics}) => {
  const { 
    items,
    currentSetId,
    setShowCombinedReviewModal,
    showCombinedReviewModal,
    refreshReviews,
  } = useComparison();

  const { user } = useAuth();
  const { currentTheme } = useTheme();
  
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !currentSetId) {
      console.error('User must be logged in and set ID must be present');
      return;
    }

    try {
      // Create or update reviews for each item
      const reviewPromises = items.map(async (item) => {
        let reviewId = existingReviewIds[item.id];

        if (!reviewId) {
          // Create new review
          const { data: reviewData, error: reviewError } = await supabase
            .from('reviews')
            .insert([
              {
                user_id: user.id,
                item_id: item.id,
                text: '',
                likes: 0
              }
            ])
            .select()
            .single();

          if (reviewError) throw reviewError;
          reviewId = reviewData.id;
        }

        // Delete existing metrics if updating
        if (existingReviewIds[item.id]) {
          const { error: deleteError } = await supabase
            .from('review_metrics')
            .delete()
            .eq('review_id', reviewId)
            .eq('set_id', currentSetId);

          if (deleteError) throw deleteError;
        }

        // Insert the review metrics
        const metricsToInsert = comparisonMetrics.map(metric => ({
          review_id: reviewId,
          set_id: currentSetId,
          metric_name: metric.metric_name,
          value: metrics[item.id][metric.metric_name],
        }));

        const { error: metricsError } = await supabase
          .from('review_metrics')
          .insert(metricsToInsert);

        if (metricsError) throw metricsError;
      });

      await Promise.all(reviewPromises);

      // Refresh the reviews data in the context
      if (refreshReviews) {
        await refreshReviews();
      }

      // Fetch the latest data for this modal
      await fetchSetMetrics();

      // Close the modal
      setShowCombinedReviewModal(false);
    } catch (err) {
      console.error('Error submitting reviews:', err);
      setError(err.message);
    }
  };

  const renderStars = (itemId, metricName, value) => {
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
          setMetrics(prev => ({
            ...prev,
            [itemId]: {
              ...prev[itemId],
              [metricName]: star
            }
          }));
        }}
      >
        <Star size={20} className={star <= value ? 'fill-current' : ''} />
      </button>
    ));
  };

  if (!showCombinedReviewModal ) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }}>
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => setShowCombinedReviewModal(false)}
      />
      
      <div 
        className="relative w-full max-w-4xl bg-gray-900 rounded-lg p-6 overflow-x-auto"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white" style={{ color: currentTheme.colors.text }}>
            {Object.keys(existingReviewIds).length > 0 ? 'Edit Reviews' : 'Review All Items'}
          </h2>
          <button
            onClick={() => setShowCombinedReviewModal(false)}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-3 text-left text-gray-300" style={{ color: currentTheme.colors.text }}>Item</th>
                  {comparisonMetrics.map(metric => (
                    <th key={metric.metric_name} className="p-3 text-left text-gray-300 capitalize" style={{ color: currentTheme.colors.text }}>
                      {metric.metric_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-t border-gray-700">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {console.log('Image URL:', item.image_url)}
                        <img 
                          src={item.image || '/api/placeholder/300/300'} 
                          alt={item.name}

                          onError={(e) => {
                            e.target.onerror = null;
                            if (e.target.src !== 'https://fakeimg.pl/600x400?text=img') {
                              e.target.src = 'https://fakeimg.pl/600x400?text=img';
                            }
                          }}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-white" style={{ color: currentTheme.colors.text }}>{item.name}</span>
                      </div>
                    </td>
                    {comparisonMetrics.map(metric => (
                      <td key={`${item.id}-${metric.metric_name}`} className="p-3">
                        <div className="flex gap-1">
                          {renderStars(item.id, metric.metric_name, metrics[item.id]?.[metric.metric_name] || 0)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCombinedReviewModal(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6"
            >
              {Object.keys(existingReviewIds).length > 0 ? 'Update Reviews' : 'Submit Reviews'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetCombinedReviewModal; 