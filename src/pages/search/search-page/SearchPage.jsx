import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchService } from '../../../services/searchService';
import { Link } from 'react-router-dom';
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
  const [results, setResults] = useState({ sets: [], items: [], users: [] });
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
    { id: 'people', label: 'People' },
  ];

  const renderItemCard = (item, index) => (
    <div className="ml-4 mr-4" key={'item' + item.id + index}>
      <ItemCard item={item} />
    </div>
  );

  const renderComparisonCard = (comparison, index) => (
    <div key={'comparison' + comparison.set_id + index}>
      <TrendingCard set={comparison} />
    </div>
  );

  const renderUserCard = (user, index) => (
    <div className="ml-4 mr-4" key={'user' + user.user_id + index}>
      <Link
        to={`/user/${user.display_name}`}
        className="block p-4 rounded-lg border border-border bg-surface hover:bg-surface-elevated transition-colors"
      >
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
            {user.profile_image_url ? (
              <img
                src={getPublicUrl(user.profile_image_url)}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-primary text-primary-fg">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-text">{user.display_name}</h3>
          </div>
        </div>
      </Link>
    </div>
  );

  const renderResults = () => {
    const getResultsForTab = () => {
      switch (activeTab) {
        case 'all':
          return [
            ...results.sets.map(set => ({ ...set, type: 'comparison' })),
            ...results.items.map(item => ({ ...item, type: 'item' })),
            ...results.users.map(user => ({ ...user, type: 'user' })),
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
        <div className="text-center py-8 text-text">
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
    <div className="overflow-x-hidden text-text">
      <div className="p-4">
        <div className="p-4">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-border bg-transparent text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
              placeholder="Search..."
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          </form>
        </div>

        <div className="border-b border-border mt-4">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {renderResults()}
    </div>
  );
};

export default SearchPage;
