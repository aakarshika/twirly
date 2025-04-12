// File: src/components/comparison/ReviewForm.jsx

import React, { useState, useEffect } from 'react';
import { useComparison } from '../../contexts/ComparisonContext';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * Component for submitting reviews for an item
 */
const ReviewForm = () => {
  const { 
    items, 
    activeReviewItem, 
    setActiveReviewItem, 
    handleReviewSubmit 
  } = useComparison();
  
  // Default review state with empty text and default metrics
  const defaultReview = { 
    text: '', 
    metrics: {}
  };
  
  const [review, setReview] = useState(defaultReview);
  
  // Get the current item being reviewed
  const currentItem = items.find(item => item.id === activeReviewItem);
  
  // Update the metrics when the active review item changes
  useEffect(() => {
    if (currentItem) {
      // Initialize metrics with default values
      const defaultMetrics = {
        views: 1,
        rating: 1,
        reviews: 1,
        comparisons: 1
      };
      
      setReview({
        text: '',
        metrics: defaultMetrics
      });
    } else {
      setReview(defaultReview);
    }
  }, [activeReviewItem, currentItem]);
  
  // Update a specific metric
  const handleMetricChange = (metric, value) => {
    setReview({
      ...review,
      metrics: {
        ...review.metrics,
        [metric]: parseInt(value, 10)
      }
    });
  };
  
  // Submit the review
  const submitReview = () => {
    handleReviewSubmit(review);
  };
  
  // Close the form
  const closeForm = () => {
    setActiveReviewItem(null);
  };
  
  if (!currentItem) {
    return null;
  }
  
  return (
    <Modal
      isOpen={!!activeReviewItem}
      onClose={closeForm}
      title={`Review: ${currentItem.name}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Review text input */}
        <div className="mb-4">
          <label className="block text-sm mb-2 text-gray-400">Your review</label>
          <textarea 
            value={review.text}
            onChange={(e) => setReview({...review, text: e.target.value})}
            placeholder="Share your thoughts..."
            className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-white text-white"
            rows="3"
          />
        </div>
        
        {/* Metrics sliders */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-lg">Rate it:</h4>
          
          {Object.keys(review.metrics).map(metric => (
            <div key={metric} className="space-y-1">
              <div className="flex justify-between">
                <label className="text-sm capitalize text-gray-300">{metric}</label>
                <span className="text-sm">{review.metrics[metric]}/10</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={review.metrics[metric]} 
                onChange={(e) => handleMetricChange(metric, e.target.value)}
                className="w-full h-2 bg-gray-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
          ))}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline"
            onClick={closeForm}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={submitReview}
            disabled={!review.text.trim()}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewForm;