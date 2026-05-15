import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, RefreshCw } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { useTheme } from '@contexts/ThemeContext';
import { useTrending } from '../../contexts/TrendingContext';
import TrendingCard from '../../components/common/common-cards/TrendingCard';
import PullToRefresh from '../../components/common/PullToRefresh';

const PAGE_SIZE = 20;
const EASE = [0.16, 1, 0.3, 1];

const SkeletonCard = ({ t }) => (
  <motion.div
    animate={{ opacity: [0.5, 0.85, 0.5] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    style={{ background: t.bgDeep, borderRadius: 8, overflow: 'hidden' }}
  >
    <div style={{ height: 128, background: `color-mix(in srgb, ${t.ink} 10%, transparent)` }} />
    <div className="p-3 space-y-2">
      <div style={{ height: 12, width: '70%', background: `color-mix(in srgb, ${t.ink} 8%, transparent)`, borderRadius: 4 }} />
      <div style={{ height: 10, width: '38%', background: `color-mix(in srgb, ${t.ink} 6%, transparent)`, borderRadius: 4 }} />
    </div>
  </motion.div>
);

const SkeletonGrid = ({ t }) => (
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
    {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} t={t} />)}
  </div>
);

const EmptyState = ({ t, onCreateClick }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <p
      style={{ fontFamily: '"Caveat", cursive', fontSize: 26, color: t.ink, opacity: 0.6 }}
      className="mb-2"
    >
      nothing here yet.
    </p>
    <p
      style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.ink, opacity: 0.55, maxWidth: 280 }}
      className="mb-7"
    >
      Be the first to spark a debate.
    </p>
    <button
      type="button"
      onClick={onCreateClick}
      className="flex items-center gap-2 px-6 py-3 rounded-full transition-opacity hover:opacity-75 active:opacity-60"
      style={{
        fontFamily: '"Fraunces", serif',
        fontSize: 14,
        fontWeight: 600,
        background: t.ink,
        color: t.bg,
        border: `2px solid ${t.ink}`,
        minHeight: 44,
      }}
    >
      <PlusCircle size={15} aria-hidden />
      create a comparison
    </button>
  </div>
);

const ErrorState = ({ t, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <p
      style={{ fontFamily: '"Caveat", cursive', fontSize: 24, color: t.red, opacity: 0.85 }}
      className="mb-3"
    >
      something went wrong.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="flex items-center gap-1.5 transition-opacity hover:opacity-70 active:opacity-50"
      style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.65 }}
    >
      <RefreshCw size={14} aria-hidden />
      try again
    </button>
  </div>
);

const CategoryChips = ({ t, categories, selected, onSelect }) => (
  <div className="flex gap-2 overflow-x-auto px-5 sm:px-10 py-3">
    {[{ id: null, name: 'All' }, ...categories].map(({ id, name }) => {
      const active = selected === id;
      return (
        <button
          key={id ?? '__all__'}
          type="button"
          onClick={() => onSelect(id)}
          className="shrink-0 px-4 py-1.5 rounded-full transition-opacity hover:opacity-80 active:opacity-60"
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 13,
            fontWeight: active ? 600 : 400,
            background: active ? t.ink : t.bgDeep,
            color: active ? t.bg : t.ink,
            border: `1.5px solid ${active ? t.ink : 'transparent'}`,
            minHeight: 32,
          }}
        >
          {name}
        </button>
      );
    })}
  </div>
);

const Trending = () => {
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const { sets, loading, error, fetchTrending, fetchFiltered } = useTrending();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchTrending({ limit: PAGE_SIZE });
  }, [fetchTrending]);

  const categories = useMemo(() => {
    const seen = new Map();
    for (const s of sets) {
      if (s.category_id && s.category_name && !seen.has(s.category_id)) {
        seen.set(s.category_id, { id: s.category_id, name: s.category_name });
      }
    }
    return [...seen.values()];
  }, [sets]);

  const visibleSets = useMemo(
    () => (selectedCategory === null ? sets : sets.filter(s => s.category_id === selectedCategory)),
    [sets, selectedCategory],
  );

  const hasMore = !loading && visibleSets.length > 0 && visibleSets.length >= limit;

  const handleCategorySelect = id => {
    setSelectedCategory(id);
    setLimit(PAGE_SIZE);
    if (id === null) fetchTrending({ limit: PAGE_SIZE });
    else fetchFiltered({ categoryId: id, limit: PAGE_SIZE });
  };

  const handleRefresh = async () => {
    setLimit(PAGE_SIZE);
    if (selectedCategory === null) await fetchTrending({ limit: PAGE_SIZE });
    else await fetchFiltered({ categoryId: selectedCategory, limit: PAGE_SIZE });
  };

  const fetchMore = () => {
    if (loading) return;
    const next = limit + PAGE_SIZE;
    setLimit(next);
    if (selectedCategory === null) fetchTrending({ limit: next });
    else fetchFiltered({ categoryId: selectedCategory, limit: next });
  };

  return (
    <div
      style={{ background: t.bg, color: t.ink, minHeight: '100vh', fontFamily: '"Fraunces", serif' }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />

      <div className="relative z-10 max-w-screen-xl mx-auto">

        {/* Page header */}
        <div className="flex items-end justify-between px-5 sm:px-10 pt-6 pb-1">
          <div>
            <p style={{ fontFamily: '"Caveat", cursive', fontSize: 17, color: t.ink, opacity: 0.58 }}>
              vote. argue. repeat.
            </p>
            <h1
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontStyle: 'italic',
                fontSize: 'clamp(28px, 6vw, 44px)',
                lineHeight: 1.0,
                color: t.ink,
                margin: 0,
              }}
            >
              what&apos;s trending.
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate('/new-comparison')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full transition-opacity hover:opacity-75 active:opacity-55 mb-1"
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 13,
              fontWeight: 500,
              background: t.red,
              color: '#fff',
              minHeight: 36,
            }}
            aria-label="Create a comparison"
          >
            <PlusCircle size={14} aria-hidden />
            create
          </button>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <CategoryChips
            t={t}
            categories={categories}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
        )}

        {/* Feed */}
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="px-5 sm:px-10 pb-10 pt-2">
            {loading && sets.length === 0 ? (
              <SkeletonGrid t={t} />
            ) : error ? (
              <ErrorState t={t} onRetry={handleRefresh} />
            ) : visibleSets.length === 0 ? (
              <EmptyState t={t} onCreateClick={() => navigate('/new-comparison?load_draft=true')} />
            ) : (
              <InfiniteScroll
                dataLength={visibleSets.length}
                next={fetchMore}
                hasMore={hasMore}
                loader={
                  <div className="flex justify-center py-6">
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                      style={{ color: t.ink, opacity: 0.4 }}
                      aria-label="Loading more"
                    />
                  </div>
                }
                endMessage={
                  visibleSets.length > PAGE_SIZE && (
                    <p
                      className="text-center py-8"
                      style={{ fontFamily: '"Caveat", cursive', fontSize: 18, color: t.ink, opacity: 0.4 }}
                    >
                      you&apos;ve seen it all.
                    </p>
                  )
                }
                style={{ overflow: 'visible' }}
              >
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleSets.map((set, i) => (
                    <motion.div
                      key={set.set_id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.32), ease: EASE }}
                    >
                      <TrendingCard set={set} />
                    </motion.div>
                  ))}
                </div>
              </InfiniteScroll>
            )}

            {/* Refresh spinner when reloading with existing data */}
            {loading && sets.length > 0 && (
              <div className="flex justify-center py-4">
                <RefreshCw
                  size={16}
                  className="animate-spin"
                  style={{ color: t.ink, opacity: 0.35 }}
                  aria-hidden
                />
              </div>
            )}
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default Trending;
