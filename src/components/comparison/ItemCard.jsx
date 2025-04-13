// File: src/components/comparison/ItemCard.jsx

import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, MessageSquare, Heart, ChevronDown, ChevronUp, BarChart, Star } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { getItemReviews } from '../../services/reviews';
import Metrics from '../common/Metrics';
import Button from '../common/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { COMPARISON_COLOR_SET } from '../../lib/constants';
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
        {/* Progress Indicator Container */}
        <div className="absolute inset-0">
          {/* Progress Fill */}
          <div 
            className={`absolute inset-0 transition-all duration-100 ${
              votedItemId === item.id ? 'bg-amber-400/30' : 'bg-primary-500/30'
            }`}
            style={{ 
              width: votedItemId === item.id ? '100%' : `${progress}%`,
              clipPath: 'none'
            }}
          />
          
          {/* Progress Marker */}
          <div className="absolute top-0 right-0 w-1 h-full bg-primary-500/50" />
          
          {/* Progress Text */}
          {isPressing && !userVoted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                Hold to vote ({Math.round(progress)}%)
              </div>
            </div>
          )}

          {/* Already Voted Indicator */}
          {userVoted && votedItemId === item.id && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-amber-400/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-amber-400 text-sm font-medium flex items-center gap-2 border border-amber-400/30">
                <ThumbsUp size={14} />
                <span>Your Vote</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Item Header with Image */}
        <div className="relative">
          <div className="relative h-48">
            {!imageError ? (
              <div className="relative w-full h-full">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-400"></div>
                  </div>
                )}
                <img 
                  src={item.image} 
                  alt={item.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  loading="lazy"
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
                {/* Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent" style={{ background: COMPARISON_COLOR_SET[i]  }}>
                  <h3 className="text-xl font-bold text-white line-clamp-1">{item.name}</h3>
                  <p className="text-gray-200 text-sm line-clamp-2">{item.description}</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800" style={{ background: COMPARISON_COLOR_SET[i]  }}>
                <div className="text-center px-4" >
                  <h3 className="text-xl font-bold text-gray-300 mb-2">{item.name}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            )}
            {/* <span className="absolute top-2 left-2 bg-black/80 border border-gray-800 text-xs px-2 py-1 rounded">
              {item.category}
            </span> */}
          </div>
        </div>
        
          {/* Vote Count - Only show if user has voted */}
          {userVoted && (
            <div className="p-4 space-y-4 text-sm text-gray-400">
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