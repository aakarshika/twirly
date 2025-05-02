import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import ProductHeader from '../components/product-details/ProductHeader';
import QuickStats from '../components/product-details/QuickStats';
import ProductTabs from '../components/product-details/ProductTabs';
import { useAuth } from '../contexts/AuthContext';
import { useHeader } from '../contexts/HeaderContext';
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
  const [activeTab, setActiveTab] = useState('reviews');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { isHeaderVisible } = useHeader();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const REVIEWS_PER_PAGE = 3;

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // Fetch item details with company, category, and metrics
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select(`
            *,
            categories (*),
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

        // Fetch comparison sets where this item appears
        const { data: setsData, error: setsError } = await supabase
          .from('comparison_sets')
          .select(`
            *,
            currentitem:comparison_set_items!inner(items(*)),
            allitems:comparison_set_items(items(*)),
            comparison_set_aspects(
                *,
                comparison_set_comments(*),
                votes(*)
            )
          `)
          .eq('comparison_set_items.item_id', itemId);

        if (setsError) throw setsError;
        
        const totalVotes = setsData.reduce((sum, set) => sum + (set.votes?.length || 0), 0);
        // Fetch metrics for each set
        const transformedSets = await Promise.all(setsData.map(async (set) => {
          // First, get all reviews for this item
          const { data: setReviews, error: reviewsError } = await supabase
            .from('reviews')
            .select(`
              *
            `)
            .eq('item_id', itemId);

          if (reviewsError) throw reviewsError;


          // Get comment count from comparison_set_aspects
          const { data: aspectsData, error: aspectsError } = await supabase
            .from('comparison_set_aspects')
            .select('*')
            .eq('set_id', set.id)
            .select();

          if (aspectsError) throw aspectsError;

          return {
            totalVotes,
            ...set,
            reviews: setReviews,
            aspects: aspectsData
          };
        }));

        console.log("transformedSets",transformedSets);
        setComparisonSets(transformedSets);


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
          user_preferences (*),
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
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background,
      position: 'relative',
      top: isHeaderVisible ? '64px' : '0px',
    }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductHeader item={item} />
        <QuickStats comparisonSets={comparisonSets} reviews={reviews} />
        <ProductTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reviews={reviews}
          item={item}
          comparisonSets={comparisonSets}
          hasMoreReviews={hasMoreReviews}
          loadingReviews={loadingMoreReviews}
          loadMoreReviews={loadMoreReviews}
        />
      </div>
    </div>
  );
};

export default ProductDetails; 