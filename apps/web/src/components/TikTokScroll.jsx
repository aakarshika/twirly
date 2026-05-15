import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, TrendingUp } from 'lucide-react';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useComparisonSets } from '@hooks/useComparisonSets';
import { splitAndJoin } from '@utils/utils';
import ComparisonCard from '../pages/compare-page/ComparisonCard';

const TikTokScroll = () => {
  const { id: currentId } = useParams();
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  const [currentSelectedTag, setCurrentSelectedTag] = useState('user_home_feed_91819');
  const [isCommentsCollapsed, setIsCommentsCollapsed] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef(null);
  const cardRefs = useRef([]);
  const activeTagRef = useRef(null);
  const hasInitiallyScrolled = useRef(false);

  const {
    comparisonSets,
    currentIndex,
    setCurrentIndex,
    handleVote,
    handleReset,
    userPreferences,
    allCategories,
    setCategoryId,
    setCategoryIds,
    setSelectedTag,
    handleLikeComparisonSet,
  } = useComparisonSets(parseInt(currentId) || 0);

  // Scroll to the card matching the URL param on first load
  useEffect(() => {
    if (hasInitiallyScrolled.current || comparisonSets.length === 0 || currentIndex <= 0) return;
    const el = cardRefs.current[currentIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      hasInitiallyScrolled.current = true;
    }
  }, [comparisonSets, currentIndex]);

  // IntersectionObserver — detect which card is snapped into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const idx = Number(entry.target.dataset.cardIndex);
            setActiveIndex(idx);
            setCurrentIndex(idx);
            setIsCommentsCollapsed(true);
            const set = comparisonSets[idx];
            if (set) navigate(`/compare/${set.id}`, { replace: true });
          }
        }
      },
      { threshold: 0.55 },
    );
    cardRefs.current.filter(Boolean).forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [comparisonSets, navigate, setCurrentIndex]);

  // Auto-advance 2.5 s after voting (cleanup cancels if user scrolls away first)
  const activeHasVoted = comparisonSets[activeIndex]?.hasVoted ?? false;
  useEffect(() => {
    if (!activeHasVoted) return;
    const timer = setTimeout(() => {
      cardRefs.current[activeIndex + 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 2500);
    return () => clearTimeout(timer);
  }, [activeHasVoted, activeIndex]);

  // Keep the active category chip scrolled into view
  useEffect(() => {
    activeTagRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentSelectedTag]);

  const handleTagChange = tag => {
    const cat = allCategories.find(c => c.name.toLowerCase().trim() === tag.toLowerCase().trim());
    setCategoryId(cat?.userCat ? cat?.id : null);
    setCategoryIds(cat && !cat.userCat ? cat?.included_categories : null);
    setSelectedTag(tag);
    setCurrentSelectedTag(tag);
  };

  const chipStyle = active => ({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: '"Caveat", cursive',
    fontSize: 14,
    color: active ? t.bg : t.ink,
    background: active ? t.ink : 'transparent',
    border: `1px solid ${active ? t.ink : `${t.ink}22`}`,
    borderRadius: 20,
    padding: '4px 12px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.15s, color 0.15s',
  });

  const SYSTEM_TAGS = [
    { id: 'user_home_feed_91819', label: 'Feed', icon: <Home size={13} /> },
    { id: 'trending',             label: 'Trending', icon: <TrendingUp size={13} /> },
  ];

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: t.bg,
        overflow: 'hidden',
      }}
    >
      {/* Category chip bar */}
      <div
        style={{
          flexShrink: 0,
          background: t.bg,
          borderBottom: `1px solid ${t.ink}12`,
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div
          className="flex gap-2 px-3 py-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {SYSTEM_TAGS.map(({ id, label, icon }) => (
            <button
              key={id}
              ref={currentSelectedTag === id ? activeTagRef : null}
              onClick={() => handleTagChange(id)}
              style={chipStyle(currentSelectedTag === id)}
            >
              {icon}
              {label}
            </button>
          ))}

          {allCategories.filter(c => c.userCat).slice(0, 3).map(cat => (
            <button
              key={cat.name}
              ref={currentSelectedTag === cat.name ? activeTagRef : null}
              onClick={() => handleTagChange(cat.name)}
              style={chipStyle(currentSelectedTag === cat.name)}
            >
              {cat.name}
            </button>
          ))}

          {allCategories.filter(c => !c.userCat).map(cat => (
            <button
              key={cat.name}
              ref={currentSelectedTag === cat.name ? activeTagRef : null}
              onClick={() => handleTagChange(cat.name)}
              style={chipStyle(currentSelectedTag === cat.name)}
            >
              {splitAndJoin(cat.name)}
            </button>
          ))}
        </div>
      </div>

      {/* CSS scroll-snap container */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: isCommentsCollapsed ? 'scroll' : 'hidden',
          scrollSnapType: isCommentsCollapsed ? 'y mandatory' : 'none',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {comparisonSets.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{ height: '100%' }}
          >
            <p style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 15,
              color: t.ink,
              opacity: 0.4,
              textAlign: 'center',
            }}>
              No comparisons here yet.
            </p>
          </div>
        ) : (
          comparisonSets.map((set, i) => (
            <div
              key={set.id}
              ref={el => { cardRefs.current[i] = el; }}
              data-card-index={i}
              style={{ scrollSnapAlign: 'start', height: '100%', flexShrink: 0 }}
            >
              <ComparisonCard
                setData={set}
                isActive={i === activeIndex}
                isCommentsCollapsed={isCommentsCollapsed}
                setIsCommentsCollapsed={setIsCommentsCollapsed}
                handleVote={handleVote}
                handleReset={handleReset}
                handleLikeComparisonSet={handleLikeComparisonSet}
                userPreferences={userPreferences}
                setHasUserInteracted={() => {}}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TikTokScroll;
