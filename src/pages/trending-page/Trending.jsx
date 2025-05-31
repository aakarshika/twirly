import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useHeader } from '../../contexts/HeaderContext';
import { MessageSquare, Square, TrendingUp, Users } from 'lucide-react';
import { COMPARISON_COLOR_SET } from '../../lib/constants';
import { randomPastelColor, splitAndJoin } from '../../lib/utils';
import TrendingCard from '../../components/common/common-cards/TrendingCard';
import TrendingCardCommon from '../../components/common/common-cards/TrendingCardCommon';
import { useTrending } from '../../contexts/TrendingContext';
import PullToRefresh from '../../components/common/PullToRefresh';

const ITEMS_PER_PAGE = 10;

const Trending = () => {
  const { trendingSets, loading, error, fetchTrendingSets } = useTrending();
  const containerRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState([]);
  const [page, setPage] = useState(1);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);
  const hasRestoredScroll = useRef(false);

  // Initialize data
  useEffect(() => {
    if (trendingSets.length === 0) {
      fetchTrendingSets();
    }
  }, []);

  // Handle lazy loading
  useEffect(() => {
    const items = trendingSets.slice(0, page * ITEMS_PER_PAGE);
    setVisibleItems(items);

    // Set up intersection observer for infinite scroll
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && visibleItems.length < trendingSets.length) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [trendingSets, page, loading]);

  // Handle scroll position
  useEffect(() => {
    if (!hasRestoredScroll.current && visibleItems.length > 0) {
      const savedScroll = sessionStorage.getItem('trending_scroll_position');
      const savedCardPosition = sessionStorage.getItem('trending_card_position');

      if (savedScroll || savedCardPosition) {
        // Add a small delay to ensure content is fully rendered
        setTimeout(() => {
          // If we have a card position, use that for more precise scrolling
          if (savedCardPosition) {
            const targetPosition = parseInt(savedCardPosition, 10);
            window.scrollTo({
              top: targetPosition,
              behavior: 'instant'
            });
          } else if (savedScroll) {
            // Fallback to general scroll position
            window.scrollTo({
              top: parseInt(savedScroll, 10),
              behavior: 'instant'
            });
          }
          
          hasRestoredScroll.current = true;
          // Clear the saved positions after restoring
          sessionStorage.removeItem('trending_scroll_position');
          sessionStorage.removeItem('trending_card_position');
        }, 100); // Small delay to ensure content is rendered
      }
    }
  }, [visibleItems]);

  // Save scroll position when leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (window.scrollY > 0) {
        sessionStorage.setItem('trending_scroll_position', window.scrollY.toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (window.scrollY > 0) {
        sessionStorage.setItem('trending_scroll_position', window.scrollY.toString());
      }
    };
  }, []);

  const handleRefresh = async () => {
    setPage(1);
    await fetchTrendingSets();
  };

  if (loading && trendingSets.length === 0) {
    return null; // Loading screen is now handled by LoadingContext
  }

  if (error) {
    return null; // Error screen is now handled by LoadingContext
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div 
        ref={containerRef}
        className="min-h-screen w-full max-w-7xl mx-auto"
      >
        <div className="flex p-4 md:p-6 lg:p-8 transition-all duration-200 mt-10">
          <TrendingUp size={24} className="mr-2 transition-colors duration-200" 
                     style={{ color: 'var(--color-primary)' }} />
          <p className="text-md font-semibold transition-colors duration-200" 
              style={{ color: 'var(--color-text)' }}>
            Trending Comparisons
          </p>
        </div>
        <div 
          className="mx-auto transition-all duration-200 ease-in-out"
        >
          <div 
            className="border-b transition-colors duration-200" 
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6 lg:p-8">
              {visibleItems.map((set, index) => (
                <div 
                  key={`trending-set-${set.aspect_set_id}-${index}`}
                  className="transition-transform duration-200 hover:scale-[1.02]"
                >
                  <TrendingCardCommon set={set} from={'trending'} />
                </div>
              ))}
              {visibleItems.length < trendingSets.length && (
                <div 
                  key="loading-indicator"
                  ref={loadingRef}
                  className="flex justify-center py-4"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" 
                       style={{ borderColor: 'var(--color-primary)' }}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default Trending; 