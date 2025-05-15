import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComparisonAspectDetails } from './useComparisonAspectDetails';

export const usePollScreenAspect = (id) => {
  const navigate = useNavigate();
  const [showStartAnimation, setShowStartAnimation] = useState(true);
  const [showEndAnimation, setShowEndAnimation] = useState(false);
  const [nextCardData, setNextCardData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [height, setHeight] = useState('100vh');

  const {
    items,
    currentSet,
    currentAspectSet,
    totalVotes,
    userVoted,
    votedItemId,
    handleVote,
    handleRevertVote,
    itemReviews,
    loading,
    error,
    fetchComparisonDetails,
    handleLikeComparisonAspectSet,
    handleNext
  } = useComparisonAspectDetails(id);

  // Preload next card data
  useEffect(() => {
    const nextId = parseInt(id) + 1;
    fetchComparisonDetails(nextId).then(data => {
      setNextCardData(data);
    });
  }, [id]);

  useEffect(() => {
    setShowStartAnimation(true);
    if (id) {
      fetchComparisonDetails();
    }
    const timer = setTimeout(() => {
      setShowStartAnimation(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    setHeight('100vh');
  }, []);

  const handlePreviousNavigation = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setShowEndAnimation(true);
    
    setTimeout(() => {
      if (nextCardData) {
        // Update state with nextCardData if needed
      }
      
      navigate('/comparison-aspect/' + (parseInt(id) - 1).toString());
      
      setShowEndAnimation(false);
      setShowStartAnimation(true);
      setIsTransitioning(false);
      
      setTimeout(() => {
        setShowStartAnimation(false);
      }, 600);
    }, 300);
  };

  const handleNextNavigation = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setShowEndAnimation(true);
    
    setTimeout(() => {
      if (nextCardData) {
        // Update state with nextCardData if needed
      }
      
      navigate('/comparison-aspect/' + (parseInt(id) + 1).toString());
      
      setShowEndAnimation(false);
      setShowStartAnimation(true);
      setIsTransitioning(false);
      
      setTimeout(() => {
        setShowStartAnimation(false);
      }, 600);
    }, 300);
  };

  return {
    // State
    showStartAnimation,
    showEndAnimation,
    isTransitioning,
    height,
    items,
    currentSet,
    currentAspectSet,
    totalVotes,
    userVoted,
    votedItemId,
    itemReviews,
    loading,
    error,
    
    // Actions
    handleVote,
    handleRevertVote,
    handleLikeComparisonAspectSet,
    handlePreviousNavigation,
    handleNextNavigation,
  };
}; 