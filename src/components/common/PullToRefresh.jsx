import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children, scrollableRef }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);
  const THRESHOLD = 100; // Distance needed to trigger refresh

  const isAtTop = () => {
    if (scrollableRef && scrollableRef.current) {
      const el = scrollableRef.current;
      // Only check scrollTop if the element is actually scrollable
      if (el.scrollHeight > el.clientHeight) {
        return el.scrollTop === 0;
      }
    }
    return window.scrollY === 0;
  };

  const handleTouchStart = useCallback((e) => {
    if (isAtTop()) {
      startY.current = e.touches[0].clientY;
    }
  }, [scrollableRef]);

  const handleTouchMove = useCallback((e) => {
    if (isAtTop() && startY.current > 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(distance * 0.5);
      }
    }
  }, [scrollableRef]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    startY.current = 0;
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <div
        className="absolute left-0 right-0 flex items-center justify-center"
        style={{
          transform: `translateY(${pullDistance}px)`,
          top: '-60px',
          zIndex: 50,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {pullDistance > 0 && (
          <div className="flex items-center space-x-2">
            <RefreshCw
              size={24}
              className={`${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: `rotate(${pullDistance}deg)`,
                color: 'var(--color-primary)',
                transition: 'transform 0.1s ease-out'
              }}
            />
            <span style={{ color: 'var(--color-text)' }}>
              {pullDistance >= THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
      </div>
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh; 