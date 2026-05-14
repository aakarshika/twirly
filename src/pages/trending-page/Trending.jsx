import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useTrending } from '../../contexts/TrendingContext';
import TrendingCard from '../../components/common/common-cards/TrendingCard';
import PullToRefresh from '../../components/common/PullToRefresh';

const SkeletonCard = () => (
  <div className="rounded-lg overflow-hidden bg-surface border border-border animate-pulse">
    <div className="h-32 bg-surface-elevated" />
    <div className="px-3 pt-2 pb-3 space-y-2">
      <div className="h-3 bg-surface-elevated rounded w-3/4" />
      <div className="h-2.5 bg-surface-elevated rounded w-1/3" />
      <div className="h-2 bg-surface-elevated rounded w-1/2 mt-3" />
    </div>
  </div>
);

const EmptyState = ({ onCreateClick }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
      style={{ backgroundColor: 'rgb(var(--surface-elevated))' }}
    >
      <PlusCircle size={28} style={{ color: 'rgb(var(--primary))' }} />
    </div>
    <p className="font-semibold text-text mb-1">No comparisons yet</p>
    <p className="text-sm text-text-muted mb-6">Be the first to spark a debate!</p>
    <button
      type="button"
      onClick={onCreateClick}
      className="px-5 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90"
      style={{ backgroundColor: 'rgb(var(--primary))', color: 'rgb(var(--primary-fg))' }}
    >
      Create a comparison
    </button>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <p className="text-danger font-medium mb-2">Failed to load comparisons</p>
    <button
      type="button"
      onClick={onRetry}
      className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
    >
      <RefreshCw size={14} />
      Try again
    </button>
  </div>
);

const CategoryChips = ({ categories, selected, onSelect }) => (
  <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
    <button
      type="button"
      onClick={() => onSelect(null)}
      className="shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors"
      style={{
        backgroundColor: selected === null ? 'rgb(var(--primary))' : 'rgb(var(--surface-elevated))',
        color: selected === null ? 'rgb(var(--primary-fg))' : 'rgb(var(--text-muted))',
      }}
    >
      All
    </button>
    {categories.map(({ id, name }) => (
      <button
        key={id}
        type="button"
        onClick={() => onSelect(id)}
        className="shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors"
        style={{
          backgroundColor: selected === id ? 'rgb(var(--primary))' : 'rgb(var(--surface-elevated))',
          color: selected === id ? 'rgb(var(--primary-fg))' : 'rgb(var(--text-muted))',
        }}
      >
        {name}
      </button>
    ))}
  </div>
);

const Trending = () => {
  const { sets, loading, error, fetchTrending, fetchFiltered } = useTrending();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Initial fetch
  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  // Derive unique categories from loaded sets
  const categories = useMemo(() => {
    const seen = new Map();
    for (const s of sets) {
      if (s.category_id && s.category_name && !seen.has(s.category_id)) {
        seen.set(s.category_id, { id: s.category_id, name: s.category_name });
      }
    }
    return [...seen.values()];
  }, [sets]);

  // Filtered view (client-side when we have data; server-side re-fetch when switching to a new category)
  const visibleSets = useMemo(() => {
    if (selectedCategory === null) return sets;
    return sets.filter((s) => s.category_id === selectedCategory);
  }, [sets, selectedCategory]);

  const handleCategorySelect = async (id) => {
    setSelectedCategory(id);
    if (id === null) {
      fetchTrending();
    } else {
      fetchFiltered({ categoryId: id });
    }
  };

  const handleRefresh = async () => {
    if (selectedCategory === null) {
      await fetchTrending();
    } else {
      await fetchFiltered({ categoryId: selectedCategory });
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen">
        {/* Category filter chips */}
        {(categories.length > 0 || loading) && (
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
        )}

        {/* Content */}
        {loading && sets.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 pb-4">
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <ErrorState onRetry={handleRefresh} />
        ) : visibleSets.length === 0 ? (
          <EmptyState onCreateClick={() => navigate('/new-comparison?load_draft=true')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 pb-4">
            {visibleSets.map((set) => (
              <TrendingCard key={set.set_id} set={set} />
            ))}
            {/* Subtle loading indicator when refreshing with existing data */}
            {loading && sets.length > 0 && (
              <div className="col-span-full flex justify-center py-4">
                <RefreshCw size={18} className="animate-spin text-text-muted" />
              </div>
            )}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default Trending;
