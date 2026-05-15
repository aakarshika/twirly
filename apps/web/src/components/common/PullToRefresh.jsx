import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 100;

const PullToRefresh = ({ onRefresh, children, scrollableRef }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const isAtTop = useCallback(() => {
    const el = scrollableRef?.current;
    if (el && el.scrollHeight > el.clientHeight) return el.scrollTop === 0;
    return window.scrollY === 0;
  }, [scrollableRef]);

  const handleTouchStart = useCallback(e => {
    if (isAtTop()) startY.current = e.touches[0].clientY;
  }, [isAtTop]);

  const handleTouchMove = useCallback(e => {
    if (!isAtTop() || startY.current === 0) return;
    const distance = e.touches[0].clientY - startY.current;
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(distance * 0.5);
    }
  }, [isAtTop]);

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
    if (!container) return undefined;
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {pullDistance > 0 && (
        <div
          className="absolute left-0 right-0 flex items-center justify-center gap-2"
          style={{
            top: -60,
            transform: `translateY(${pullDistance}px)`,
            zIndex: 50,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <RefreshCw
            size={24}
            className={isRefreshing ? 'animate-spin' : ''}
            style={{
              transform: `rotate(${pullDistance}deg)`,
              color: 'var(--color-primary)',
            }}
          />
          <span style={{ color: 'var(--color-text)', fontSize: 14 }}>
            {pullDistance >= THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}
      <div style={{ transform: `translateY(${pullDistance}px)`, transition: 'transform 0.1s ease-out' }}>
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
