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
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center transition-all duration-300 ease-in-out"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto transition-transform duration-300" 
               style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4" style={{ color: 'var(--color-text)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center transition-all duration-300 ease-in-out"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center animate-fade-in">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchTrendingSets()}
            className="px-4 py-2 rounded-full font-semibold transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text)'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div 
        ref={containerRef}
        className="min-h-screen w-full max-w-7xl mx-auto sm:px-6 lg:px-8"
        style={{ 
          backgroundColor: 'var(--color-background)'
        }}
      >
        <div className="flex justify-center mt-10 p-4 md:p-6 lg:p-8 transition-all duration-200">
          <TrendingUp size={24} className="mr-2 transition-colors duration-200" 
                     style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-2xl font-bold transition-colors duration-200" 
              style={{ color: 'var(--color-text)' }}>
            Trending Comparisons
          </h1>
        </div>
        <div 
          className="mx-auto transition-all duration-200 ease-in-out"
          style={{
            backgroundColor: 'var(--color-card)'
          }}
        >
          <div 
            className="border-b transition-colors duration-200" 
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="space-y-4 p-4 md:p-6 lg:p-8">
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