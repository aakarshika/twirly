// File: src/contexts/ComparisonContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { initialItemSets, getDefaultMetrics } from '../data/itemSets';
import { castVote, getVoteCount, hasUserVoted, revertVote } from '../services/voting';
import { submitReview, likeReview, getItemReviews } from '../services/reviews';
import apiClient from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { COMPARISON_COLOR_SET } from '../lib/constants';
export const useComparison = (id) => {

  const [items, setItems] = useState([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentSetId, setCurrentSetId] = useState(id);
  const [currentComparisonName, setCurrentComparisonName] = useState(null);
  const [currentComparisonDescription, setCurrentComparisonDescription] = useState(null);
  const [currentSet, setCurrentSet] = useState(null);
  const [userVoted, setUserVoted] = useState(false);
  const [completedSets, setCompletedSets] = useState([]);
  const [votedItemId, setVotedItemId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Review state
  const [activeReviewItem, setActiveReviewItem] = useState(null);
  const [activeDetailsItem, setActiveDetailsItem] = useState(null);
  const [showCombinedReviewModal, setShowCombinedReviewModal] = useState(false);
  
  // Custom comparison state
  const [customMode, setCustomMode] = useState(false);
  const [customItems, setCustomItems] = useState([
    { name: "", description: "", category: "Custom" },
    { name: "", description: "", category: "Custom" },
    { name: "", description: "", category: "Custom" },
    { name: "", description: "", category: "Custom" }
  ]);

  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Initialize with stored comparison data if available
  useEffect(() => {
    if (!isInitialized) {
      const storedComparison = localStorage.getItem('currentComparison');
      const storedSetId = localStorage.getItem('currentSetId');
      if (storedComparison) {
        const comparison = JSON.parse(storedComparison);
        // console.log("comparisonnnnnnnn",comparison);
        setItems(comparison.items);
        localStorage.removeItem('currentComparison');
      }
      if (storedSetId) {
        setCurrentSetId(parseInt(storedSetId));
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Add effect to persist currentSetId
  useEffect(() => {
    if (currentSetId !== null) {
      localStorage.setItem('currentSetId', currentSetId.toString());
    }
  }, [currentSetId]);

  // Move to the next set of items
  const loadNextSet = () => {
    // Store the results from the current set
    setCompletedSets(prev => [
      ...prev, 
      {
        category: items[0].category,
        items: [...items],
        winner: [...items].sort((a, b) => b.votes - a.votes)[0]
      }
    ]);
    
    // Move to the next set
    const nextIndex = (currentSetIndex + 1) % initialItemSets.length;
    setCurrentSetIndex(nextIndex);
    setItems(initialItemSets[nextIndex]);
    setUserVoted(false);
    setVotedItemId(null);
    setActiveReviewItem(null);
    setActiveDetailsItem(null);
  };

  // Reset everything to default state
  const resetToDefault = () => {
    setItems(initialItemSets[0]);
    setCurrentSetIndex(0);
    setUserVoted(false);
    setVotedItemId(null);
    setCompletedSets([]);
    setCustomMode(false);
    setActiveReviewItem(null);
    setActiveDetailsItem(null);
  };

  // Handle review submission
  const handleReviewSubmit = async (reviewData) => {
    if (activeReviewItem && reviewData.text.trim()) {
      try {
        // Submit review to database
        const { review, metrics } = await submitReview(
          activeReviewItem,
          user.id,
          reviewData.text,
          reviewData.metrics
        );

        // Update local state with the new review
        setItems(prevItems => 
          prevItems.map(item => {
            if (item.id === activeReviewItem) {
              // Calculate updated metrics based on new review
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
                    id: review.id,
                    text: review.text,
                    metrics: reviewData.metrics,
                    timestamp: review.created_at,
                    likes: review.likes,
                    username: user?.user_metadata?.username || 'Someone'
                  }
                ],
                metrics: updatedMetrics
              };
            }
            return item;
          })
        );
        
        setActiveReviewItem(null);
      } catch (error) {
        console.error('Error submitting review:', error);
        // TODO: Add error handling UI
      }
    }
  };

  // Handle liking a review
  const handleReviewLike = async (itemId, reviewId) => {
    try {
      // Like review in database
      const updatedReview = await likeReview(reviewId, user.id);

      // Update local state
      setItems(prevItems => 
        prevItems.map(item => {
          if (item.id === itemId) {
            const updatedReviews = item.reviews.map(review => {
              if (review.id === reviewId) {
                return { ...review, likes: updatedReview.likes };
              }
              return review;
            });
            return { ...item, reviews: updatedReviews };
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Error liking review:', error);
      // TODO: Add error handling UI
    }
  };

  // Handle creating custom items
  const handleCustomItemChange = (index, field, value) => {
    const updated = [...customItems];
    updated[index] = { ...updated[index], [field]: value };
    setCustomItems(updated);
  };

  // Submit custom items
  const handleCustomSubmit = () => {
    const validItems = customItems.filter(item => item.name.trim());
    
    if (validItems.length < 2) {
      return false; // Not enough valid items
    }

    const newItems = validItems.map((item, index) => ({
      id: Date.now() + index,
      name: item.name,
      description: item.description || "No description provided",
      image: "/api/placeholder/300/300",
      category: item.category || "Custom",
      votes: 0,
      reviews: [],
      metrics: getDefaultMetrics(item.category || "Custom")
    }));

    setItems(newItems);
    setCustomMode(false);
    setUserVoted(false);
    return true;
  };

  const addVote = async (setId, itemId) => {
    if (!user) {
      setError('You must be logged in to vote');
      return;
    }

    try {
      await apiClient.post('/api/votes', { setId, itemId });
      setComparisons(prevComparisons =>
        prevComparisons.map(comp =>
          comp.id === setId
            ? {
                ...comp,
                votes: comp.votes.map(vote =>
                  vote.user_id === user.id
                    ? { ...vote, item_id: itemId }
                    : vote
                ),
              }
            : comp
        )
      );
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message);
    }
  };

  const addComment = async (setId, text) => {
    if (!user) {
      setError('You must be logged in to comment');
      return;
    }

    try {
      const { data: resp } = await apiClient.post('/api/comments', { setId, content: text });
      setComparisons(prevComparisons =>
        prevComparisons.map(comp =>
          comp.id === setId
            ? { ...comp, comments: [...comp.comments, resp.data] }
            : comp
        )
      );
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message);
    }
  };


  return {
        // Items and voting
        items,
        setItems,
        userVoted,
        setUserVoted,
        loadNextSet,
        resetToDefault,
        completedSets,
        currentSetIndex,
        currentSetId,
        currentComparisonName,
        setCurrentSetId,
        setCurrentComparisonName,
        currentComparisonDescription,
        setCurrentComparisonDescription,
        currentSet,
        setCurrentSet,
        votedItemId,
        setVotedItemId,
        
        // Reviews
        activeReviewItem,
        setActiveReviewItem,
        activeDetailsItem,
        setActiveDetailsItem,
        handleReviewSubmit,
        handleReviewLike,
        
        // Custom items
        customMode,
        setCustomMode,
        customItems,
        handleCustomItemChange,
        handleCustomSubmit,

        // New comparison state
        comparisons,
        setComparisons,
        loading,
        setLoading,
        error,
        setError,
        addVote,
        addComment,

        // Show combined review modal
        showCombinedReviewModal,
        setShowCombinedReviewModal
      };
};
