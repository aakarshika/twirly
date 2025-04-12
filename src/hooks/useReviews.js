// File: src/hooks/useReviews.js

import { useState } from 'react';

/**
 * Custom hook that manages review functionality
 * 
 * @param {Array} initialItems - Initial array of items with review properties
 * @returns {Object} Review state and functions
 */
const useReviews = (initialItems) => {
  const [items, setItems] = useState(initialItems);
  const [activeReviewItem, setActiveReviewItem] = useState(null);
  
  /**
   * Add a review to a specific item
   * 
   * @param {number|string} itemId - ID of the item being reviewed
   * @param {Object} reviewData - Review data including text and metrics
   * @returns {boolean} Whether the review was added successfully
   */
  const addReview = (itemId, reviewData) => {
    if (!reviewData.text.trim()) {
      return false; // Empty review text
    }
    
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          // Calculate updated metrics
          const updatedMetrics = { ...item.metrics };
          const reviewCount = item.reviews.length;
          
          Object.keys(reviewData.metrics).forEach(key => {
            const currentTotal = updatedMetrics[key] * reviewCount;
            const newTotal = currentTotal + reviewData.metrics[key];
            updatedMetrics[key] = reviewCount > 0 
              ? newTotal / (reviewCount + 1) 
              : reviewData.metrics[key];
          });
          
          return {
            ...item,
            reviews: [
              ...item.reviews, 
              {
                id: Date.now(),
                text: reviewData.text,
                metrics: reviewData.metrics,
                timestamp: new Date().toISOString(),
                likes: 0
              }
            ],
            metrics: updatedMetrics
          };
        }
        return item;
      })
    );
    
    return true;
  };
  
  /**
   * Like a specific review
   * 
   * @param {number|string} itemId - ID of the item containing the review
   * @param {number|string} reviewId - ID of the review to like
   * @returns {boolean} Whether the like was added successfully
   */
  const likeReview = (itemId, reviewId) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const updatedReviews = item.reviews.map(review => {
            if (review.id === reviewId) {
              return { ...review, likes: review.likes + 1 };
            }
            return review;
          });
          return { ...item, reviews: updatedReviews };
        }
        return item;
      })
    );
    
    return true;
  };
  
  /**
   * Get all reviews for a specific item
   * 
   * @param {number|string} itemId - ID of the item
   * @returns {Array} Array of reviews for the item
   */
  const getItemReviews = (itemId) => {
    const item = items.find(item => item.id === itemId);
    return item ? item.reviews : [];
  };
  
  /**
   * Get the average metrics for a specific item
   * 
   * @param {number|string} itemId - ID of the item
   * @returns {Object} Average metrics for the item
   */
  const getItemMetrics = (itemId) => {
    const item = items.find(item => item.id === itemId);
    return item ? item.metrics : {};
  };
  
  return {
    items,
    setItems,
    activeReviewItem,
    setActiveReviewItem,
    addReview,
    likeReview,
    getItemReviews,
    getItemMetrics
  };
};

export default useReviews;