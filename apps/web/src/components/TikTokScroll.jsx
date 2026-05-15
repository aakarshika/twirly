import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

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
    setSelectedTag,
    handleLikeComparisonSet,
  } = useComparisonSets(parseInt(currentId) || 0);

  // Trim stale card refs when the set list shrinks (e.g. after a tag change reload)
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, comparisonSets.length);
  }, [comparisonSets.length]);

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

  // Reset interaction flag whenever the visible card changes
  useEffect(() => {
    setHasUserInteracted(false);
  }, [activeIndex]);

  // Auto-advance 7 s after voting — skipped if user has interacted with the card
  const activeHasVoted = comparisonSets[activeIndex]?.hasVoted ?? false;
  useEffect(() => {
    if (!activeHasVoted || hasUserInteracted) return;
    const timer = setTimeout(() => {
      cardRefs.current[activeIndex + 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeHasVoted, activeIndex, hasUserInteracted]);

  // Keep the active category chip scrolled into view
  useEffect(() => {
    activeTagRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentSelectedTag]);

  const handleTagChange = tag => {
    const cat = allCategories.find(c => c.name.toLowerCase().trim() === tag.toLowerCase().trim());
    setCategoryId(cat?.id ?? null);
    setSelectedTag(tag);
    setCurrentSelectedTag(tag);
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const Chip = ({ id, label, icon, isActive, refProp }) => (
    <button
      ref={refProp}
      onClick={() => handleTagChange(id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        fontFamily: '"Caveat", cursive',
        fontSize: 14,
        color: isActive ? t.red : `${t.ink}70`,
        background: 'none',
        border: 'none',
        padding: '4px 10px 0',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'color 0.15s',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 4 }}>
        {icon}
        {label}
      </span>
      {isActive
        ? <motion.span layoutId="filter-underline" style={{ display: 'block', height: 2, width: '100%', background: t.red, borderRadius: 1 }} />
        : <span style={{ display: 'block', height: 2 }} />
      }
    </button>
  );

  const SYSTEM_TAGS = [
    { id: 'user_home_feed_91819', label: 'Feed', icon: <Home size={13} /> },
    { id: 'trending',             label: 'Trending', icon: <TrendingUp size={13} /> },
  ];

  return (
    <div
      style={{
        height: 'calc(100dvh - 56px - env(safe-area-inset-bottom))',
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
          className="flex gap-1 px-3 py-1 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {SYSTEM_TAGS.map(({ id, label, icon }) => (
            <Chip
              key={id}
              id={id}
              label={label}
              icon={icon}
              isActive={currentSelectedTag === id}
              refProp={currentSelectedTag === id ? activeTagRef : null}
            />
          ))}

          {allCategories.filter(c => c.userCat).slice(0, 3).map(cat => (
            <Chip
              key={`user-${cat.id}`}
              id={cat.name}
              label={cat.name}
              isActive={currentSelectedTag === cat.name}
              refProp={currentSelectedTag === cat.name ? activeTagRef : null}
            />
          ))}

          {allCategories.filter(c => !c.userCat).map(cat => (
            <Chip
              key={cat.id}
              id={cat.name}
              label={splitAndJoin(cat.name)}
              isActive={currentSelectedTag === cat.name}
              refProp={currentSelectedTag === cat.name ? activeTagRef : null}
            />
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
                hasUserInteracted={hasUserInteracted}
                setHasUserInteracted={setHasUserInteracted}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TikTokScroll;
