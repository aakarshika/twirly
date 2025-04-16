import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import ReviewForm from '../components/comparison/ReviewForm';
import ProductHeader from '../components/product-details/ProductHeader';
import QuickStats from '../components/product-details/QuickStats';
import ProductTabs from '../components/product-details/ProductTabs';
import { useAuth } from '../contexts/AuthContext';

const ProductDetails = () => {
  const { itemId } = useParams();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comparisonSets, setComparisonSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [trends, setTrends] = useState({});
  
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
            item_metrics (*),
            item_metric_averages (*)
          `)
          .eq('id', itemId)
          .single();

        if (itemError) throw itemError;
        if (!itemData) {
          setError('Item not found');
          setLoading(false);
          return;
        }
        setItem(itemData);

        // Fetch initial reviews
        await fetchReviews(1);

        // Fetch comparison sets where this item appears with detailed metrics
        const { data: setsData, error: setsError } = await supabase
          .from('comparison_set_metrics')
          .select('*')
          .filter('item_ids', 'cs', `{${itemId}}`);

        if (setsError) throw setsError;

        // Transform the data for the UI
        const transformedSets = setsData.map(set => {
          // Get votes for this specific item in the comparison
          const itemVotes = set.items.find(item => item.id === itemId)?.votes || 0;
          const totalVotes = set.items.reduce((sum, item) => sum + (item.votes || 0), 0);
          
          // Get comment count for the comparison
          const commentCount = set.items.reduce((sum, item) => sum + (item.comments || 0), 0);

          return {
            comparison_sets: {
              id: set.set_id,
              name: set.set_name,
              items: set.items
            },
            itemVotes,
            totalVotes,
            commentCount
          };
        });

        setComparisonSets(transformedSets);

        // Fetch recent activities for the product
        const { data: recentActivities, error: recentError } = await supabase
          .from('product_recent_activities')
          .select('*')
          .eq('item_id', itemId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) throw recentError;
        setRecentActivities(recentActivities || []);

        // Fetch activity trends for the product
        const { data: trends, error: trendsError } = await supabase
          .from('product_activity_trends')
          .select('*')
          .eq('item_id', itemId)
          .select();

        if (trendsError) throw trendsError;
        setTrends(trends || {});

        // Fetch weekly activity data for the product
        const { data: activityData, error: activityError } = await supabase
          .from('product_weekly_activity')
          .select('*')
          .eq('item_id', itemId)
          .order('date', { ascending: true });

        if (activityError) throw activityError;
        setActivityData(activityData || []);

        // Fetch metrics for the specific item
        const { data: metricsData, error: metricsError } = await supabase
          .from('item_metrics')
          .select('*')
          .eq('item_id', itemId)
          .select();

        if (metricsError) throw metricsError;
        setCategoryData(metricsData ? [
          { name: 'Views', value: metricsData.views || 0 },
          { name: 'Comparisons', value: metricsData.comparisons || 0 },
          { name: 'Reviews', value: metricsData.reviews || 0 }
        ] : []);

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
          profiles (username),
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
        <ProductHeader item={item} />
        <QuickStats comparisonSets={comparisonSets} reviews={reviews} />
        <ProductTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          item={item}
          reviews={reviews}
          comparisonSets={comparisonSets}
          activityData={activityData}
          categoryData={categoryData}
          recentActivities={recentActivities}
          trends={trends}
        />
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