import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComparisonAspectDetails } from './useComparisonAspectDetails';
import { useAuth } from '@/contexts/AuthContext';
export const usePollScreenAspect = (id) => {
  const navigate = useNavigate();
  const [showStartAnimation, setShowStartAnimation] = useState(true);
  const [showEndAnimation, setShowEndAnimation] = useState(false);
  const [nextCardData, setNextCardData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [height, setHeight] = useState('100vh');

  const { user } = useAuth();
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
    fetchRemainingAspects,
    handleLikeComparisonAspectSet,
    handleNext,
    fetchComparison
  } = useComparisonAspectDetails(id);

  const getPreviousId = () => {
    const previousId = parseInt(id) - 1;
    return previousId;
  }
  // Preload next card data
  useEffect(() => {
    const loadNextCard = async () => {
      const remainingAspects = await fetchRemainingAspects(id);
      console.log('remainingAspects', remainingAspects);
      if (remainingAspects.length > 0) {
        const nextId = remainingAspects[0].id;
        const nextCompData = await fetchComparison(nextId);
        setNextCardData(nextCompData);
      }
      else {
        setNextCardData(null);
      }
    };
    loadNextCard();
  }, [id]);

  useEffect(() => {
    setShowStartAnimation(true);
    if (id) {
      fetchComparisonDetails(id);
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
      
      navigate(-1);
      
      setShowEndAnimation(false);
      setShowStartAnimation(true);
      setIsTransitioning(false);
      
      setTimeout(() => {
        setShowStartAnimation(false);
      }, 600);
    }, 300);
  };

  const handleNextNavigation = async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setShowEndAnimation(true);
    
    setTimeout(async () => {
      console.log('nextCardData', nextCardData);
      if (nextCardData) {
        // Update state with nextCardData if needed
        navigate('/comparison-aspect-page/' + nextCardData.id);
        console.log('nextCardData', nextCardData);
      }
      else {
        navigate('/comparison/' + currentSet.id);
      }
      
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
    nextCardData,
  };
}; 