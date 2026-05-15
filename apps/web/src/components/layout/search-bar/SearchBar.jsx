import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { searchService } from '@services/searchService';

const RECENT_KEY = 'twirly.recent-searches';
const EASE = [0.16, 1, 0.3, 1];

const readRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
};

const persistRecent = query => {
  const next = [query, ...readRecent().filter(s => s !== query)].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
};

const TYPE_LABELS = { comparison: 'compare', item: 'item', user: 'person' };

const SkeletonRow = ({ t }) => (
  <motion.div
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      height: 38,
      borderRadius: 4,
      background: `color-mix(in srgb, ${t.ink} 8%, transparent)`,
    }}
  />
);

const SearchBar = ({ searchComplete = () => {} }) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(readRecent);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ⌘K / Ctrl+K shortcut to focus
  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setFocused(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Escape to close
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') setFocused(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    let stale = false;
    const timer = setTimeout(async () => {
      try {
        const data = await searchService.searchAll(query);
        if (!stale) setResults(data);
      } catch {
        if (!stale) setResults({ sets: [], items: [], users: [] });
      } finally {
        if (!stale) setLoading(false);
      }
    }, 300);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query]);

  const close = () => {
    setFocused(false);
    setQuery('');
    setResults(null);
    searchComplete(false);
  };

  const navigateToResult = result => {
    close();
    const routes = {
      item: `/item/${result.id}`,
      comparison: `/compare/${result.id}`,
      user: `/user/${result.id}`,
    };
    navigate(routes[result.type] ?? '/');
  };

  const goToSearch = q => {
    if (!q.trim()) return;
    setRecentSearches(persistRecent(q.trim()));
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    close();
  };

  const handleSubmit = e => {
    e.preventDefault();
    goToSearch(query);
  };

  const applyRecent = term => goToSearch(term);

  const removeRecent = (term, e) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const next = prev.filter(s => s !== term);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const allResults = results
    ? [
        ...results.sets.slice(0, 2).map(r => ({ ...r, type: 'comparison' })),
        ...results.items.slice(0, 2).map(r => ({ ...r, type: 'item' })),
        ...results.users.slice(0, 1).map(r => ({ ...r, type: 'user' })),
      ]
    : [];

  const hasQuery = query.length > 0;
  const showRecentSection = !hasQuery && recentSearches.length > 0;
  const showResults = hasQuery && (loading || results !== null);
  const showDropdown = focused && (showRecentSection || showResults);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input */}
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: t.ink,
            opacity: focused ? 0.7 : 0.4,
            pointerEvents: 'none',
            transition: 'opacity 0.15s',
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="search…"
          autoComplete="off"
          style={{
            width: '100%',
            paddingLeft: 36,
            paddingRight: hasQuery ? 36 : focused ? 16 : 52,
            paddingTop: 8,
            paddingBottom: 8,
            fontFamily: '"Fraunces", serif',
            fontSize: 14,
            color: t.ink,
            background: t.bgDeep,
            border: `1.5px solid ${focused ? `${t.ink}55` : `${t.ink}22`}`,
            borderRadius: 6,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, padding 0.15s',
          }}
        />

        {/* ⌘K hint — shown when unfocused and no query */}
        {!focused && !hasQuery && (
          <span
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: '"Caveat", cursive',
              fontSize: 12,
              color: t.ink,
              opacity: 0.35,
              background: `${t.ink}10`,
              border: `1px solid ${t.ink}18`,
              borderRadius: 4,
              padding: '1px 5px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            ⌘K
          </span>
        )}

        {/* Clear button */}
        {hasQuery && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults(null); inputRef.current?.focus(); }}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: t.ink,
              opacity: 0.4,
              display: 'flex',
              alignItems: 'center',
              minHeight: 36,
              minWidth: 36,
              justifyContent: 'center',
            }}
          >
            <X size={13} />
          </button>
        )}
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: t.bg,
              border: `1.5px solid ${t.ink}18`,
              borderRadius: 8,
              boxShadow: `0 8px 32px ${t.ink}14`,
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            {/* Recent searches */}
            {showRecentSection && (
              <div style={{ padding: '10px 0 4px' }}>
                <p
                  style={{
                    fontFamily: '"Caveat", cursive',
                    fontSize: 12,
                    color: t.ink,
                    opacity: 0.45,
                    padding: '0 14px 6px',
                    margin: 0,
                  }}
                >
                  recent
                </p>
                {recentSearches.map((term, i) => (
                  <motion.button
                    key={term}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25, ease: EASE }}
                    onClick={() => applyRecent(term)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 14px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Clock size={13} style={{ color: t.ink, opacity: 0.35, flexShrink: 0 }} />
                    <span
                      style={{
                        fontFamily: '"Fraunces", serif',
                        fontSize: 14,
                        color: t.ink,
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
                        opacity: 0.3,
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: 36,
                        minWidth: 36,
                        justifyContent: 'center',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Loading skeletons */}
            {showResults && loading && (
              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from({ length: 3 }, (_, i) => <SkeletonRow key={i} t={t} />)}
              </div>
            )}

            {/* Results */}
            {showResults && !loading && results !== null && (
              <div style={{ padding: '6px 0' }}>
                {allResults.length === 0 ? (
                  <p
                    style={{
                      fontFamily: '"Caveat", cursive',
                      fontSize: 15,
                      color: t.ink,
                      opacity: 0.5,
                      padding: '10px 14px',
                      margin: 0,
                    }}
                  >
                    nothing found for &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  <>
                    {allResults.map((result, i) => (
                      <motion.button
                        key={`${result.type}-${result.id ?? result.set_id ?? result.user_id ?? i}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25, ease: EASE }}
                        onClick={() => navigateToResult(result)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '9px 14px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          borderBottom: i < allResults.length - 1 ? `1px solid ${t.ink}0a` : 'none',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"Fraunces", serif',
                            fontSize: 14,
                            color: t.ink,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {result.name ?? result.display_name ?? result.set_name}
                        </span>
                        <span
                          style={{
                            fontFamily: '"Caveat", cursive',
                            fontSize: 12,
                            color: t.ink,
                            opacity: 0.4,
                            flexShrink: 0,
                          }}
                        >
                          {TYPE_LABELS[result.type] ?? result.type}
                        </span>
                        <ArrowUpRight size={12} style={{ color: t.ink, opacity: 0.3, flexShrink: 0 }} />
                      </motion.button>
                    ))}

                    {/* See all results */}
                    <button
                      onClick={() => goToSearch(query)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        padding: '9px 14px',
                        background: `${t.ink}06`,
                        border: 'none',
                        borderTop: `1px solid ${t.ink}12`,
                        cursor: 'pointer',
                        fontFamily: '"Caveat", cursive',
                        fontSize: 14,
                        color: t.ink,
                        opacity: 0.7,
                        gap: 6,
                      }}
                    >
                      see all results for &ldquo;{query}&rdquo;
                      <ArrowUpRight size={13} />
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
