import React, { useState } from 'react';
import { useComparison } from '../../contexts/ComparisonContext';
import Button from '../common/Button';
import { Star, X, MessageSquare } from 'lucide-react';

const ReviewModal = () => {
  const { 
    activeReviewItem, 
    setActiveReviewItem, 
    items,
    handleReviewSubmit 
  } = useComparison();

  const [reviewText, setReviewText] = useState('');
  const [metrics, setMetrics] = useState({});
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(null);

  const item = items.find(item => item.id === activeReviewItem);
  const maxChars = 500;
  const charCount = reviewText.length;

  if (!item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleReviewSubmit({
      text: reviewText,
      metrics: metrics
    });
    setReviewText('');
    setMetrics({});
  };

  const handleMetricChange = (metric, value) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: value
    }));
  };

  const renderStars = (metric, value) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => handleMetricChange(metric, star)}
        onMouseEnter={() => setHoveredRating({ metric, value: star })}
        onMouseLeave={() => setHoveredRating(null)}
        className={`w-8 h-8 transition-colors ${
          (hoveredRating?.metric === metric && hoveredRating?.value >= star) || 
          (!hoveredRating && metrics[metric] >= star) ||
          (hoveredRating?.metric !== metric && metrics[metric] >= star)
            ? 'text-amber-400'
            : 'text-gray-600'
        }`}
      >
        <Star size={20} className="fill-current" />
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/10 rounded-lg">
              <MessageSquare className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold">Review {item.name}</h2>
          </div>
          <button 
            onClick={() => setActiveReviewItem(null)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Review
            </label>
            <div className="relative">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                rows={4}
                placeholder="Share your detailed thoughts about this product..."
                maxLength={maxChars}
                required
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {charCount}/{maxChars}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">Rate the following aspects:</h3>
            <div className="space-y-6">
              {Object.keys(item.metrics).map(metric => (
                <div 
                  key={metric} 
                  className="space-y-2"
                  onMouseEnter={() => setHoveredMetric(metric)}
                  onMouseLeave={() => setHoveredMetric(null)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 capitalize">{metric}</span>
                    <span className="text-sm text-gray-400">
                      {metrics[metric] || 0}/5
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {renderStars(metric, metrics[metric])}
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
              disabled={!reviewText.trim() || Object.keys(metrics).length === 0}
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

export default ReviewModal; 