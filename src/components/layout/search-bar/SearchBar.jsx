import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { searchService } from '../../../services/searchService';

const SearchBar = ({ searchComplete }) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ sets: [], items: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length > 2) {
        setIsLoading(true);
        try {
          const searchResults = await searchService.searchAll(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Search error:', error);
          setResults({ sets: [], items: [], users: [] });
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults({ sets: [], items: [], users: [] });
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchComplete(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleResultClick = (result) => {
    setShowResults(false);
    searchComplete(false);
    // Navigate based on result type
    switch (result.type) {
      case 'item':
        navigate(`/item/${result.id}`);
        break;
      case 'comparison':
        navigate(`/compare/${result.id}`);
        break;
      case 'user':
        navigate(`/user/${result.id}`);
        break;
      default:
        break;
    }
  };

  const renderResults = () => {
    const allResults = [
      ...results.sets.map(set => ({ ...set, type: 'comparison' })),
      ...results.items.map(item => ({ ...item, type: 'item' })),
      ...results.users.map(user => ({ ...user, type: 'user' }))
    ].slice(0, 5); // Show top 5 results

    if (isLoading) {
      return <div className="px-4 py-2 text-center">Loading...</div>;
    }

    if (allResults.length === 0) {
      return <div className="px-4 py-2 text-center">No results found</div>;
    }

    return (
      <div 
      style={{ transition: 'all 0.3s ease-in-out' }}>
        {allResults.map((result, index) => (
          <button
            key={index}
            onClick={() => handleResultClick(result)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            style={{
              color: currentTheme.colors.text,
              backgroundColor: 'transparent'
            }}
          >
            <div className="flex items-center">
              <span className="font-medium">{result.name || result.display_name}</span>
              <span className="ml-2 text-sm text-gray-500">
                {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
              </span>
            </div>
          </button>
        ))}
        <div className="border-t mt-2 pt-2 px-4">
          <button
            onClick={handleSearch}
            className="w-full text-center text-sm font-medium"
            style={{ color: currentTheme.colors.primary }}
          >
            See all results for "{query}"
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative search-bar" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        {(<input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          autoFocus={true}
          onFocus={() => setShowResults(true)}
          className="w-full px-4 py-2 pl-10 pr-8 rounded-lg border"
          style={{
            backgroundColor: currentTheme.colors.card,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text
          }}
          placeholder="Search..."
        />)}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && (query.length > 2 || Object.values(results).some(arr => arr.length > 0)) && (
        <div
          className="absolute w-full mt-2 py-2 rounded-lg shadow-lg z-50"
          style={{
            backgroundColor: currentTheme.colors.card,
            borderColor: currentTheme.colors.border,
            border: '1px solid'
          }}
        >
          {renderResults()}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 