import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  StarIcon, 
  HandThumbUpIcon, 
  ChartBarIcon, 
  EyeIcon, 
  ScaleIcon, 
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  UserGroupIcon,
  ChatBubbleOvalLeftIcon
} from '@heroicons/react/24/solid';
import { useTheme } from '../contexts/ThemeContext';
import ReviewForm from '../components/comparison/ReviewForm';
import Metrics from '../components/common/Metrics';

const ProductDetails = () => {
  const { itemId } = useParams();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comparisonSets, setComparisonSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const REVIEWS_PER_PAGE = 5;

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // Fetch item details with company, category, and metrics
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select(`
            *,
            categories (*),
            item_metrics (*)
          `)
          .eq('id', itemId)
          .single();

        if (itemError) throw itemError;
        setItem(itemData);

        // Fetch initial reviews
        await fetchReviews(1);

        // Fetch comparison sets where this item appears
        const { data: setsData, error: setsError } = await supabase
          .from('comparison_set_items')
          .select(`
            comparison_sets (*)
          `)
          .eq('item_id', itemId);

        if (setsError) throw setsError;

        // Fetch votes and comments for each comparison set
        const comparisonPromises = setsData.map(async (set) => {
          // Get total votes for the comparison set
          const { data: totalVotesData, error: totalVotesError } = await supabase
            .from('votes')
            .select('*', { count: 'exact' })
            .eq('set_id', set.comparison_sets.id);

          if (totalVotesError) throw totalVotesError;

          // Get votes for this specific item in the comparison
          const { data: itemVotesData, error: itemVotesError } = await supabase
            .from('votes')
            .select('*', { count: 'exact' })
            .eq('set_id', set.comparison_sets.id)
            .eq('item_id', itemId);

          if (itemVotesError) throw itemVotesError;

          // Get comment count for the comparison
          const { data: commentsData, error: commentsError } = await supabase
            .from('comparison_set_comments')
            .select('*', { count: 'exact' })
            .eq('set_id', set.comparison_sets.id);

          if (commentsError) throw commentsError;

          return { 
            ...set, 
            totalVotes: totalVotesData.length,
            itemVotes: itemVotesData.length,
            commentCount: commentsData.length
          };
        });

        const comparisonSetsWithData = await Promise.all(comparisonPromises);
        setComparisonSets(comparisonSetsWithData);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [itemId]);

  const fetchReviews = async (page) => {
    try {
      setLoadingMoreReviews(true);
      const { data: reviewsData, error: reviewsError, count } = await supabase
        .from('reviews')
        .select(`
          *,
          users (username),
          review_metrics (*),
          review_likes (*)
        `, { count: 'exact' })
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })
        .range((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE - 1);

      if (reviewsError) throw reviewsError;

      if (page === 1) {
        setReviews(reviewsData);
      } else {
        setReviews(prev => [...prev, ...reviewsData]);
      }

      setHasMoreReviews(reviewsData.length === REVIEWS_PER_PAGE);
      setLoadingMoreReviews(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoadingMoreReviews(false);
    }
  };

  const loadMoreReviews = () => {
    if (!loadingMoreReviews && hasMoreReviews) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchReviews(nextPage);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!item) return <div className="p-4">Product not found</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
            <p className="text-gray-600 mb-4">{item.description}</p>
            {item.price && (
              <p className="text-2xl font-semibold mb-4">${item.price}</p>
            )}
            {item.categories && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Category</h2>
                <p className="text-gray-700">{item.categories.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* ... existing quick stats ... */}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4 border-b border-gray-700">
            {['overview', 'reviews', 'appearances', 'metrics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* ... existing overview content ... */}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* ... existing reviews content ... */}
            </div>
          )}

          {activeTab === 'appearances' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.colors.text }}>
                Appears in Comparisons
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisonSets.map((set) => (
                  <div 
                    key={set.comparison_sets.id} 
                    className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate(`/comparison/${set.comparison_sets.id}`)}
                  >
                    <h3 
                      className="font-semibold mb-2 text-lg hover:text-blue-400 transition-colors"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {set.comparison_sets.name}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-400">
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        <span>
                          {set.itemVotes}/{set.totalVotes} votes
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-400">
                        <ChatBubbleOvalLeftIcon className="h-4 w-4 mr-2" />
                        <span>{set.commentCount} comments</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(set.itemVotes / set.totalVotes) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.round((set.itemVotes / set.totalVotes) * 100)}% of total votes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* ... existing metrics content ... */}
            </div>
          )}
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>
                Write a Review
              </h2>
              <ReviewForm />
              <button
                onClick={() => setShowReviewForm(false)}
                className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails; 