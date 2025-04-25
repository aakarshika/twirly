import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, Clock, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTheme } from '../contexts/ThemeContext';
import TrendingSkeletonLoader from '../components/skeletons/TrendingSkeletonLoader';

const Trending = () => {
  const [trendingComparisons, setTrendingComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  const fetchTrendingComparisons = async (pageNum = 1, category = 'All', isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      
      // Base query
      let query = supabase
        .from('comparison_sets_with_users')
        .select(`
          id,
          name,
          category_id,
          created_at,
          category_name,
          username,
          display_name,
          profile_image_url,
          comparison_set_items(
            item_id,
            items(
              id,
              name,
              description,
              image_url
            )
          ),
          votes:votes(count),
          participants:votes(
            user_id
          ),
          comparison_set_aspects(
            metric_name
          )
        `)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * 4, pageNum * 4 - 1);

      // Add category filter if not 'All'
      if (category !== 'All') {
        query = query.eq('category_name', category);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch reviews for all items in the comparisons
      const itemIds = data.flatMap(comparison => 
        comparison.comparison_set_items?.map(setItem => setItem.items?.id) || []
      ).filter(Boolean);

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          item_id,
          review_metrics(
            metric_name,
            value,
            set_id
          )
        `)
        .in('item_id', itemIds);

      if (reviewsError) throw reviewsError;

      // Transform the data to match our UI structure
      const transformedData = data.map(comparison => {
        const items = comparison.comparison_set_items?.map(setItem => setItem.items) || [];
        
        // Calculate average metrics for each item
        const itemMetrics = {};
        items.forEach(item => {
          const itemReviews = reviewsData?.filter(review => review.item_id === item.id) || [];
          const metrics = {};
          
          comparison.comparison_set_aspects?.forEach(aspect => {
            const metricValues = itemReviews
              .flatMap(review => review.review_metrics)
              .filter(metric => metric.metric_name === aspect.metric_name)
              .map(metric => metric.value);
            
            const average = metricValues.length > 0 
              ? metricValues.reduce((a, b) => a + b, 0) / metricValues.length 
              : 0;
            
            metrics[aspect.metric_name] = {
              average,
              totalReviews: metricValues.length
            };
          });
          
          itemMetrics[item.id] = metrics;
        });

        // Count unique participants
        const uniqueParticipants = new Set(comparison.participants?.map(p => p.user_id) || []).size;

        return {
          id: comparison.id,
          title: comparison.name,
          category: comparison.category_name || 'Uncategorized',
          votes: comparison.votes?.[0]?.count || 0,
          participants: uniqueParticipants,
          timeAgo: formatTimeAgo(comparison.created_at),
          image1: items[0]?.image_url || 'https://placehold.co/400x300/1a1a1a/ffffff?text=No+Image',
          image2: items[1]?.image_url || 'https://placehold.co/400x300/1a1a1a/ffffff?text=No+Image',
          user: {
            id: comparison.user_id,
            name: comparison.display_name || comparison.username || 'Anonymous',
            image: comparison.profile_image_url || 'https://placehold.co/100x100/1a1a1a/ffffff?text=U'
          },
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            image: item.image_url,
            category: comparison.category_name || 'Uncategorized',
            averageMetrics: itemMetrics[item.id] || {},
            reviews: reviewsData?.filter(review => review.item_id === item.id) || []
          }))
        };
      });

      setHasMore(data.length === 4);
      if (pageNum === 1) {
        setTrendingComparisons(transformedData);
      } else {
        setTrendingComparisons(prev => [...prev, ...transformedData]);
      }
    } catch (error) {
      console.error('Error fetching trending comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  useEffect(() => {
    fetchTrendingComparisons(1, selectedCategory, true);
  }, [selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    setTrendingComparisons([]);
  };

  const handleComparisonClick = (comparison) => {
    navigate(`/comparison/${comparison.id}`);
  };

  const handleImageLoad = (comparisonId, imageKey) => {
    setImageLoading(prev => ({
      ...prev,
      [`${comparisonId}-${imageKey}`]: false
    }));
  };

  const handleImageError = (comparisonId, imageKey) => {
    setImageErrors(prev => ({
      ...prev,
      [`${comparisonId}-${imageKey}`]: true
    }));
    setImageLoading(prev => ({
      ...prev,
      [`${comparisonId}-${imageKey}`]: false
    }));
  };

  const fetchMoreData = () => {
    if (!hasMore) return;
    setPage(prev => prev + 1);
    fetchTrendingComparisons(page + 1, selectedCategory);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <TrendingUp className="mr-3" style={{ color: currentTheme.colors.primary }} size={32} />
            Trending Comparisons
          </h1>
          <p className="text-gray-400">See what's hot in the community right now</p>
        </div>

        {/* Categories Filter */}
        <div className="flex justify-center gap-4 mb-8">
          {['All', 'Technology', 'Entertainment', 'Lifestyle', 'Food', 'Gaming'].map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-amber-400 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              } transition-colors`}
            >
              {category}
            </button>
          ))}
        </div>
        {/* Infinite Scroll Component */}
        <InfiniteScroll
          dataLength={trendingComparisons.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-400 mx-auto"></div>
            </div>
          }
          endMessage={
            <div className="text-center py-8 text-gray-400">
              <p>No more comparisons to load</p>
            </div>
          }
        >
          {/* Trending Comparisons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {loading ? (
              <TrendingSkeletonLoader />
            ) : (
              trendingComparisons.map((comparison) => (
                <div
                  key={comparison.id}
                  onClick={() => handleComparisonClick(comparison)}
                  className="rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  <div className="p-6" style={{ color: currentTheme.colors.text }}>
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                      {/* User Info Section */}
                        <img 
                          src={comparison.user.image} 
                          alt={comparison.user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium">{comparison.user.name}</p>
                          <p className="text-xs text-gray-400">{comparison.timeAgo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-gray-400">
                          <ThumbsUp size={16} />
                          <span className="text-sm">{comparison.votes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Users size={16} />
                          <span className="text-sm">{comparison.items[0].reviews.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-4 line-clamp-2">{comparison.title}</h3>

                    {/* Images Section */}
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1">
                        {!imageErrors[`${comparison.id}-image1`] ? (
                          <div className="relative w-full h-48">
                            {imageLoading[`${comparison.id}-image1`] !== false && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-400"></div>
                              </div>
                            )}
                            <img
                              src={comparison.image1}
                              alt={comparison.items[0]?.name || 'Item 1'}
                              className={`w-full h-48 object-cover rounded-lg transition-opacity duration-300 ${
                                imageLoading[`${comparison.id}-image1`] !== false ? 'opacity-0' : 'opacity-100'
                              }`}
                              loading="lazy"
                              onLoad={() => handleImageLoad(comparison.id, 'image1')}
                              onError={() => handleImageError(comparison.id, 'image1')}
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                              <h4 className="text-white font-medium truncate">{comparison.items[0]?.name}</h4>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center bg-gray-800 rounded-lg">
                            <div className="text-center p-4">
                              <h3 className="text-xl font-bold text-gray-300 mb-2">
                                {comparison.items[0]?.name || 'Item 1'}
                              </h3>
                              <p className="text-sm text-gray-400 line-clamp-2">
                                {comparison.items[0]?.description || 'No description available'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        {!imageErrors[`${comparison.id}-image2`] ? (
                          <div className="relative w-full h-48">
                            {imageLoading[`${comparison.id}-image2`] !== false && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-400"></div>
                              </div>
                            )}
                            <img
                              src={comparison.image2}
                              alt={comparison.items[1]?.name || 'Item 2'}
                              className={`w-full h-48 object-cover rounded-lg transition-opacity duration-300 ${
                                imageLoading[`${comparison.id}-image2`] !== false ? 'opacity-0' : 'opacity-100'
                              }`}
                              loading="lazy"
                              onLoad={() => handleImageLoad(comparison.id, 'image2')}
                              onError={() => handleImageError(comparison.id, 'image2')}
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                              <h4 className="text-white font-medium truncate">{comparison.items[1]?.name}</h4>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center bg-gray-800 rounded-lg">
                            <div className="text-center p-4">
                              <h3 className="text-xl font-bold text-gray-300 mb-2">
                                {comparison.items[1]?.name || 'Item 2'}
                              </h3>
                              <p className="text-sm text-gray-400 line-clamp-2">
                                {comparison.items[1]?.description || 'No description available'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metrics and Reviews Section */}
                    {(comparison.items[0]?.averageMetrics || comparison.items[0]?.reviews?.length > 0) && (
                      <div className="">
                        <div className="">
                          {/* Top Metrics */}
                          {comparison.items[0]?.averageMetrics && Object.keys(comparison.items[0].averageMetrics).length > 0 && (
                            <div>
                              <div className="flex flex-row">
                                {Object.entries(comparison.items[0].averageMetrics)
                                  .sort(([, a], [, b]) => b.average - a.average)
                                  .slice(0, 2)
                                  .map(([metric, data]) => (
                                      <span className="text-sm text-gray-400 bg-gray-200 rounded-full px-2 py-1">{metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Trending; 