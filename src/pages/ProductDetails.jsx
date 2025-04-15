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
            item_metrics (*)
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

        // Fetch comparison sets where this item appears
        const { data: setsData, error: setsError } = await supabase
          .from('comparison_set_items')
          .select(`
            comparison_sets (*)
          `)
          .eq('item_id', itemId);

        if (setsError) throw setsError;

        // Check if setsData is null or empty
        if (!setsData || setsData.length === 0) {
          setComparisonSets([]);
        } else {
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
              .eq('user_id', user.id);

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
        }

        // Fetch weekly activity data
        const { data: weeklyActivity, error: weeklyError } = await supabase
          .from('user_weekly_activity')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (weeklyError) throw weeklyError;
        setActivityData(weeklyActivity || []);

        // Fetch recent activities
        const { data: recentActivities, error: recentError } = await supabase
          .from('user_recent_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) throw recentError;
        setRecentActivities(recentActivities || []);

        // Fetch activity trends
        const { data: trends, error: trendsError } = await supabase
          .from('user_activity_trends')
          .select('*')
          .eq('user_id', user.id)
          .select();

        if (trendsError) throw trendsError;
        setTrends(trends || {});

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
        .eq('user_id', user.id)
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