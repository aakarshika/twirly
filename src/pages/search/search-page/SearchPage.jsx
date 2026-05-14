import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { searchService } from '../../../services/searchService';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { getPublicUrl } from '../../../lib/utils';
import { useHeader } from '../../../contexts/HeaderContext';
import ItemCard from '../../../components/common/common-cards/ItemCard';
import TrendingCard from '../../../components/common/common-cards/TrendingCard';
import { useLoading } from '../../../contexts/LoadingContext';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [activeTab, setActiveTab] = useState('all');
  const { currentTheme } = useTheme();
  const [filters, setFilters] = useState({
    sortBy: 'relevance',
    timeRange: 'all',
    type: 'all'
  });
  const [results, setResults] = useState({ sets: [], items: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isHeaderVisible } = useHeader();
  const { setLoading, setError: setGlobalError } = useLoading();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading('global', true, 'Searching...');
      try {
        const searchResults = await searchService.searchAll(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setGlobalError('global', 'Failed to fetch search results. Please try again.', () => window.location.reload());
      } finally {
        setLoading('global', false);
      }
    };

    fetchResults();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'items', label: 'Items' },
    { id: 'comparisons', label: 'Comparisons' },
    { id: 'people', label: 'People' }
  ];

  const renderItemCard = (item, index) => {
    return (
      <div className='ml-4 mr-4' key={'item' + item.id + index}>
        <ItemCard item={item} />
      </div>
    );
  };

  const renderComparisonCard = (comparison, index) => {
    return (
      <div key={'comparison' + comparison.aspect_set_id + index}>
        <TrendingCard set={comparison} />
      </div>
    )
  };

  const renderUserCard = (user, index) => {
    return (
      <div className='ml-4 mr-4' key={'user' + user.user_id + index}>
      <Link
        to={`/user/${user.display_name}`}
        className="block p-4 rounded-lg hover:bg-gray-50"
        style={{
          backgroundColor: currentTheme.colors.card,
          borderColor: currentTheme.colors.border,
          border: '1px solid'
        }}
      >
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
            {user.profile_image_url ? (
              <img
                src={getPublicUrl(user.profile_image_url)}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: currentTheme.colors.primary }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium" style={{ color: currentTheme.colors.text }}>
              { user.display_name}
            </h3>
          </div>
        </div>
      </Link>
      </div>
    );
  };

  const renderResults = () => {
    if (isLoading) {
      return null; // Loading screen is now handled by LoadingContext
    }

    const getResultsForTab = () => {
      switch (activeTab) {
        case 'all':
          return [
            ...results.sets.map(set => ({ ...set, type: 'comparison' })),
            ...results.items.map(item => ({ ...item, type: 'item' })),
            ...results.users.map(user => ({ ...user, type: 'user' }))
          ];
        case 'comparisons':
          return results.sets.map(set => ({ ...set, type: 'comparison' }));
        case 'items':
          return results.items.map(item => ({ ...item, type: 'item' }));
        case 'people':
          return results.users.map(user => ({ ...user, type: 'user' }));
        default:
          return [];
      }
    };

    const filteredResults = getResultsForTab();

    if (filteredResults.length === 0) {
      return (
        <div className="text-center py-8" style={{ color: currentTheme.colors.text }}>
          {query && query.length > 0 ? `No results found for "${query}"` : 'Type to search...'}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredResults.map((result, index) => {
          switch (result.type) {
            case 'item':
              return renderItemCard(result, index);
            case 'comparison':
              return renderComparisonCard(result, index);
            case 'user':
              return renderUserCard(result, index);
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <div 
      className="overflow-x-hidden"
      style={{ 
        color: currentTheme.colors.text
      }}
    >
      {/* Search Header */}
      <div className="p-4">
      <div className="p-4"
      >
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-lg border"
            style={{
              backgroundColor: 'transparent',
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.text
            }}
            placeholder="Search..."
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} />
        </form>
      </div>

      {/* Tabs */}
      <div className="border-b mt-4" style={{ borderColor: currentTheme.colors.border }}>
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 font-medium ${
                activeTab === tab.id
                  ? 'border-b-2'
                  : 'text-gray-500'
              }`}
              style={{
                borderColor: activeTab === tab.id ? currentTheme.colors.primary : 'transparent',
                color: activeTab === tab.id ? currentTheme.colors.primary : currentTheme.colors.text
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {false && (<div className="flex items-center space-x-4 mb-6">
        <Filter size={20} />
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="px-3 py-2 rounded-md"
          style={{
            backgroundColor: currentTheme.colors.card,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text
          }}
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
        </select>

        <select
          value={filters.timeRange}
          onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
          className="px-3 py-2 rounded-md"
          style={{
            backgroundColor: currentTheme.colors.card,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text
          }}
        >
          <option value="all">All Time</option>
          <option value="day">Past 24 Hours</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
        </select>
      </div>)}
      </div>
      {/* Search Results */}
      {renderResults()}
    </div>
  );
};

export default SearchPage; 