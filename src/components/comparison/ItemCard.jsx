// File: src/components/comparison/ItemCard.jsx

import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, MessageSquare, Heart, ChevronDown, ChevronUp, BarChart, Star } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { getItemReviews } from '../../services/reviews';
import Metrics from '../common/Metrics';
import Button from '../common/Button';
import { useTheme } from '../../contexts/ThemeContext';
import ImageLoader from './ImageLoader';
import VotingProgress from './VotingProgress';
import './ItemCard.css';
/**
 * Card component for displaying a single comparison item
 */
const ItemCard = ({ item ,i }) => {
  const { 
    userVoted, 
    handleVote, 
    setActiveReviewItem,
    activeReviewItem,
    handleReviewLike,
    votedItemId
  } = useComparison();
  console.log(i);

  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showAllMetrics, setShowAllMetrics] = useState(false);
  const [showReviews, setShowReviews] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const pressTimer = useRef(null);
  const progressInterval = useRef(null);

  const VOTE_DURATION = 1000; // 1 second

  // Get top 3 metrics sorted by value
  const topMetrics = Object.entries(item.averageMetrics || {})
    .sort(([, a], [, b]) => b.average - a.average)
    .map(([title, data]) => ({ 
      title, 
      value: data.average,
      totalReviews: data.totalReviews
    }));

  // Load reviews when the reviews section is opened
  const loadReviews = async (page = 1) => {
    if (!showReviews) return;
    
    setLoadingReviews(true);
    try {
      const result = await getItemReviews(item.id, page, 3);
      setReviews(prev => page === 1 ? result.reviews : [...prev, ...result.reviews]);
      setHasMoreReviews(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load more reviews
  const loadMoreReviews = () => {
    loadReviews(currentPage + 1);
  };

  // Only reset reviews when the component unmounts
  useEffect(() => {
    return () => {
      setReviews([]);
      setCurrentPage(1);
      setHasMoreReviews(false);
    };
  }, []);

  // Load reviews when showReviews changes
  useEffect(() => {
    if (showReviews) {
      loadReviews(1);
    }
  }, [showReviews]);
  
  const { currentTheme } = useTheme();

  const startVoting = () => {
    if (userVoted) {
      console.log('User has already voted, ignoring vote attempt');
      return;
    }
    
    console.log('Starting vote process for item:', item.id);
    setIsPressing(true);
    setProgress(0);
    
    // Start progress animation
    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / VOTE_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        console.log('Vote progress reached 100%, casting vote');
        clearInterval(progressInterval.current);
        handleVote(item.id);
      }
    }, 10);

    // Set timer for vote completion
    pressTimer.current = setTimeout(() => {
      if (progress < 100) {
        clearInterval(progressInterval.current);
        setProgress(0);
      }
    }, VOTE_DURATION);
  };

  const cancelVoting = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setIsPressing(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleReviewButtonClick = (itemId) => {
    setActiveReviewItem(itemId); // Set the active review item
    console.log('Current item:', item);
  };

  return (
    <div className="relative">
      <div 
        style={{ 
          backgroundColor: currentTheme.colors.card,
          borderColor: currentTheme.colors.border,
          borderWidth: '1px',
          borderStyle: 'solid',
          color: currentTheme.colors.text
        }}
        className={`relative border border-gray-800 rounded-lg overflow-hidden transition-all bg-gray-900 pb-16 ${
          votedItemId === item.id ? 'border-amber-400' : ''
        }`}
        onMouseDown={!userVoted ? startVoting : undefined}
        onMouseUp={!userVoted ? cancelVoting : undefined}
        onMouseLeave={!userVoted ? cancelVoting : undefined}
        onTouchStart={!userVoted ? startVoting : undefined}
        onTouchEnd={!userVoted ? cancelVoting : undefined}
      >
        
        <VotingProgress 
          isPressing={isPressing} 
          progress={progress} 
          userVoted={userVoted} 
          itemId={item.id} 
          handleVote={handleVote} 
          startVoting={startVoting} 
          cancelVoting={cancelVoting} 
          votedItemId={votedItemId}
        />
        
        <ImageLoader 
          image={item.image} 
          name={item.name} 
          item={item}
          description={item.description} 
          index={i} 
        />
        
        
          {/* Vote Count - Only show if user has voted */}
          {userVoted && (
            <div className="p-4 text-sm text-gray-400">
              {item.votes} {item.votes === 1 ? 'vote' : 'votes'} 
            </div>
          )}
          
          
      </div>

      {/* Review Button */}
      <button
        className="absolute bottom-0 left-0 right-0 w-full px-4 py-2 text-sm font-medium text-white border border-gray-700 rounded-b-lg hover:bg-gray-900 disabled:border-gray-800 disabled:text-gray-600 flex items-center justify-center gap-2 z-10 bg-gray-900"
        disabled={!userVoted}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Review button clicked', {
            itemId: item.id,
            userVoted,
            votedItemId,
            activeReviewItem
          });
          handleReviewButtonClick(item.id);
        }}
      >
        <MessageSquare size={14} />
        Review
      </button>
    </div>
  );
};

export default ItemCard;