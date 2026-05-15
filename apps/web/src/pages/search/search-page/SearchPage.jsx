import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, Clock, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { useTheme } from '@contexts/ThemeContext';
import { searchService } from '@services/searchService';
import { getPublicUrl } from '@utils/utils';
import ItemCard from '@components/common/common-cards/ItemCard';
import TrendingCard from '@components/common/common-cards/TrendingCard';

const EASE = [0.16, 1, 0.3, 1];
const RECENT_KEY = 'twirly.recent-searches';
const SCROLL_KEY = 'twirly.search-scroll';

const readRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
};

const SkeletonCard = ({ t }) => (
  <motion.div
    animate={{ opacity: [0.35, 0.65, 0.35] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    style={{ background: t.bgDeep, borderRadius: 6, height: 72 }}
  />
);

const SectionHeader = ({ label, count, t }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      paddingBottom: 8,
      borderBottom: `1.5px solid ${t.ink}18`,
      marginBottom: 12,
    }}
  >
    <span
      style={{
        fontFamily: '"DM Serif Display", serif',
        fontStyle: 'italic',
        color: t.ink,
        fontSize: 20,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: '"Caveat", cursive',
        color: t.ink,
        opacity: 0.5,
        fontSize: 14,
      }}
    >
      {count}
    </span>
  </div>
);

const UserResult = ({ user, t }) => (
  <Link to={`/user/${user.display_name}`} style={{ display: 'block', textDecoration: 'none' }}>
    <motion.div
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: `1px solid ${t.ink}10`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          background: t.bgDeep,
          border: `1.5px solid ${t.ink}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {user.profile_image_url ? (
          <img
            src={getPublicUrl(user.profile_image_url)}
            alt={user.display_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              color: t.ink,
              fontSize: 18,
            }}
          >
            {user.username?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: '"Fraunces", serif',
            color: t.ink,
            fontSize: 15,
            margin: 0,
            fontWeight: 500,
          }}
        >
          {user.display_name}
        </p>
        {user.username && (
          <p
            style={{
              fontFamily: '"Caveat", cursive',
              color: t.ink,
              opacity: 0.55,
              fontSize: 13,
              margin: 0,
            }}
          >
            @{user.username}
          </p>
        )}
      </div>
      <ArrowUpRight size={14} style={{ color: t.ink, opacity: 0.35, flexShrink: 0 }} />
    </motion.div>
  </Link>
);

const TABS = [
  { id: 'all', label: 'all' },
  { id: 'comparisons', label: 'comparisons' },
  { id: 'items', label: 'items' },
  { id: 'people', label: 'people' },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(query);
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(readRecent);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    const el = scrollRef.current;
    if (saved && el) el.scrollTop = parseInt(saved, 10);

    return () => {
      if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
    };
  }, []);

  useEffect(() => {
    if (!query) {
      setResults(null);
      setLoading(false);
      return;
    }

    let stale = false;
    setLoading(true);

    searchService
      .searchAll(query)
      .then(data => {
        if (stale) return;
        setResults(data);
        setRecentSearches(prev => {
          const next = [query, ...prev.filter(s => s !== query)].slice(0, 5);
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {
        if (!stale) setResults({ sets: [], items: [], users: [] });
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [query]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      if (query) setSearchParams({});
      return;
    }
    if (trimmed === query) return;
    const timer = setTimeout(() => setSearchParams({ q: trimmed }), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSubmit = e => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) setSearchParams({ q: trimmed });
  };

  const clearInput = () => {
    setSearchInput('');
    setSearchParams({});
    setResults(null);
    inputRef.current?.focus();
  };

  const applySearch = term => {
    setSearchInput(term);
    setSearchParams({ q: term });
  };

  const removeRecent = (term, e) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const next = prev.filter(s => s !== term);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const tabCount = tabId => {
    if (!results) return 0;
    switch (tabId) {
      case 'comparisons': return results.sets.length;
      case 'items': return results.items.length;
      case 'people': return results.users.length;
      default: return results.sets.length + results.items.length + results.users.length;
    }
  };

  const totalCount = results
    ? results.sets.length + results.items.length + results.users.length
    : 0;

  const visibleSets =
    activeTab === 'all' || activeTab === 'comparisons' ? (results?.sets ?? []) : [];
  const visibleItems =
    activeTab === 'all' || activeTab === 'items' ? (results?.items ?? []) : [];
  const visibleUsers =
    activeTab === 'all' || activeTab === 'people' ? (results?.users ?? []) : [];
  const visibleCount = visibleSets.length + visibleItems.length + visibleUsers.length;
  const isAll = activeTab === 'all';

  return (
    <div
      ref={scrollRef}
      style={{
        background: t.bg,
        color: t.ink,
        minHeight: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <PaperGrain blend={t.blend} />

      {/* Sticky search bar */}
      <div
        className="sticky top-0 z-20 px-5 sm:px-10 pt-4 pb-3"
        style={{ background: t.bg, borderBottom: `1px solid ${t.ink}12` }}
      >
        <div className="max-w-screen-xl mx-auto">
          <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                color: t.ink,
                opacity: 0.45,
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="search comparisons, items, people…"
              autoComplete="off"
              style={{
                width: '100%',
                paddingLeft: 44,
                paddingRight: searchInput ? 44 : 16,
                paddingTop: 12,
                paddingBottom: 12,
                fontFamily: '"Fraunces", serif',
                fontSize: 16,
                color: t.ink,
                background: t.bgDeep,
                border: `1.5px solid ${t.ink}22`,
                borderRadius: 8,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => {
                e.target.style.borderColor = `${t.ink}55`;
              }}
              onBlur={e => {
                e.target.style.borderColor = `${t.ink}22`;
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearInput}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: t.ink,
                  opacity: 0.45,
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 44,
                  minWidth: 44,
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Tab strip — only shown when a query is active */}
          {query && (
            <div
              className="flex gap-1 mt-3"
              style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
            >
              {TABS.map(tab => {
                const active = activeTab === tab.id;
                const count = tabCount(tab.id);
                const dimmed = results && count === 0 && tab.id !== 'all';
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      fontFamily: '"Caveat", cursive',
                      fontSize: 15,
                      padding: '4px 14px',
                      borderRadius: 20,
                      border: active
                        ? `1.5px solid ${t.ink}`
                        : `1.5px solid ${t.ink}28`,
                      background: active ? t.ink : 'transparent',
                      color: active ? t.bg : t.ink,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      opacity: dimmed ? 0.4 : 1,
                      transition: 'all 0.15s ease',
                      minHeight: 32,
                    }}
                  >
                    {tab.label}
                    {results && tab.id !== 'all' && count > 0 && ` (${count})`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Page body */}
      <div className="relative z-10 px-5 sm:px-10 pt-6 pb-20 max-w-screen-xl mx-auto">

        {/* Empty state — no query yet */}
        {!query && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p
              style={{
                fontFamily: '"Caveat", cursive',
                fontSize: 18,
                color: t.ink,
                opacity: 0.6,
                marginBottom: 4,
              }}
            >
              what are you looking for?
            </p>
            <h1
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontStyle: 'italic',
                fontSize: 'clamp(40px, 10vw, 76px)',
                lineHeight: 0.96,
                color: t.ink,
                marginBottom: 36,
              }}
            >
              search everything.
            </h1>

            {recentSearches.length > 0 && (
              <div>
                <p
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontStyle: 'italic',
                    color: t.ink,
                    opacity: 0.6,
                    fontSize: 16,
                    marginBottom: 10,
                  }}
                >
                  recent
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentSearches.map((term, i) => (
                    <motion.div
                      key={term}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.35, ease: EASE }}
                      onClick={() => applySearch(term)}
                      whileTap={{ scale: 0.99 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      <Clock size={14} style={{ color: t.ink, opacity: 0.4, flexShrink: 0 }} />
                      <span
                        style={{
                          fontFamily: '"Fraunces", serif',
                          color: t.ink,
                          fontSize: 15,
                          flex: 1,
                        }}
                      >
                        {term}
                      </span>
                      <button
                        onClick={e => removeRecent(term, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          color: t.ink,
                          opacity: 0.35,
                          display: 'flex',
                          alignItems: 'center',
                          minHeight: 44,
                          minWidth: 44,
                          justifyContent: 'center',
                        }}
                      >
                        <X size={13} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonCard key={i} t={t} />
            ))}
          </motion.div>
        )}

        {/* Results */}
        {!loading && results && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${query}-${activeTab}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {totalCount === 0 ? (
                /* Global no-results */
                <div style={{ paddingTop: 48, textAlign: 'center' }}>
                  <p
                    style={{
                      fontFamily: '"DM Serif Display", serif',
                      fontStyle: 'italic',
                      fontSize: 'clamp(32px, 8vw, 56px)',
                      color: t.ink,
                      lineHeight: 1,
                      marginBottom: 12,
                    }}
                  >
                    nothing here.
                  </p>
                  <p
                    style={{
                      fontFamily: '"Caveat", cursive',
                      color: t.ink,
                      opacity: 0.6,
                      fontSize: 18,
                    }}
                  >
                    try different words, or fewer of them.
                  </p>
                </div>
              ) : visibleCount === 0 ? (
                /* Tab-level no-results (other tabs have results) */
                <div style={{ paddingTop: 32, textAlign: 'center' }}>
                  <p
                    style={{
                      fontFamily: '"Caveat", cursive',
                      color: t.ink,
                      opacity: 0.6,
                      fontSize: 18,
                    }}
                  >
                    no {activeTab} found for &ldquo;{query}&rdquo;
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {/* Comparisons section */}
                  {visibleSets.length > 0 && (
                    <div>
                      {isAll && (
                        <SectionHeader label="comparisons" count={visibleSets.length} t={t} />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {visibleSets.map((set, i) => (
                          <motion.div
                            key={set.set_id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }}
                          >
                            <TrendingCard set={set} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items section */}
                  {visibleItems.length > 0 && (
                    <div>
                      {isAll && (
                        <SectionHeader label="items" count={visibleItems.length} t={t} />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {visibleItems.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }}
                          >
                            <ItemCard item={item} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* People section */}
                  {visibleUsers.length > 0 && (
                    <div>
                      {isAll && (
                        <SectionHeader label="people" count={visibleUsers.length} t={t} />
                      )}
                      <div>
                        {visibleUsers.map((user, i) => (
                          <motion.div
                            key={user.user_id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }}
                          >
                            <UserResult user={user} t={t} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
