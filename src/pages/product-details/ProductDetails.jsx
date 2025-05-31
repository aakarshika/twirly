import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import ProductHeader from './ProductHeader';
import QuickStats from './QuickStats';
import ProductTabs from './ProductTabs';
import { useAuth } from '../../contexts/AuthContext';
import { useHeader } from '../../contexts/HeaderContext';
import CommentAppearancesTab from './tabs/CommentAppearancesTab';
import AppearancesTab from './tabs/AppearancesTab';
import { changeColorAlpha } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useLoading } from '../../contexts/LoadingContext';
import PullToRefresh from '../../components/common/PullToRefresh';

const ProductDetails = () => {
  const { itemId } = useParams();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comparisonSets, setComparisonSets] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('mentions');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { isHeaderVisible } = useHeader();
  const { setLoading, setError: setGlobalError } = useLoading();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const REVIEWS_PER_PAGE = 3;

  const fetchProductDetails = async () => {
    try {
      setLoading('global', true, 'Loading product details...');
      
      // Fetch item details with company, category, and metrics
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select(`
          *,
          categories!item_categories (*),
          item_metric_averages (*)
        `)
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      if (!itemData) {
        setError('Item not found');
        setGlobalError('global', 'Item not found', () => window.location.reload());
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

      setComparisonSets(transformedSets);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err.message);
      setGlobalError('global', err.message, () => window.location.reload());
    } finally {
      setLoading('global', false);
    }
  };

  useEffect(() => {
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
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setGlobalError('global', 'Failed to load reviews. Please try again.', () => window.location.reload());
    } finally {
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

  const handleRefresh = async () => {
    await fetchProductDetails();
  };

  if (error) {
    return null; // Error screen is now handled by LoadingContext
  }

  if (!item) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center transition-all duration-300 ease-in-out"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center animate-fade-in">
          <p style={{ color: 'var(--color-text)' }}>Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div 
        className="min-h-screen overflow-x-hidden " style={{  color: currentTheme.colors.text }}
      >
        <div className='max-w-7xl mx-auto w-full  z-10'>
          <div className='' >
            <motion.div className="absolute inset-0 overflow-hidden pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}>
              <motion.div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
                   style={{ backgroundColor: 'rgba(205, 170, 240, 0.35)' }}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1, scale: 1.2, x: -100, y: -100 }}
                   transition={{ duration: 2, delay: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}></motion.div>
              <motion.div className="absolute left-0 bottom-0 w-80 h-80 rounded-full opacity-20"
                   style={{ backgroundColor: 'rgba(205, 226, 247, 0.35)' }}
                   initial={{ opacity: 1 }}
                   animate={{ opacity: 0, scale: 1.5, x: -100, y: -100 }}
                   transition={{ duration: 3, delay: 0, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}></motion.div>
              <motion.div className="absolute left-0 top-0 w-60 h-60 rounded-full opacity-20"
                   style={{ backgroundColor: 'rgba(217, 205, 247, 0.42)' }}
                   initial={{ opacity: 1 }}
                   animate={{ opacity: 0, scale: 1.5, x: 100, y: 100 }}
                   transition={{ duration: 3, delay: 0, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}></motion.div>
            </motion.div>
          </div>
          <div className="px-4 md:px-6 lg:px-8" >
            <div className="space-y-8">
              <QuickStats comparisonSets={comparisonSets} reviews={reviews} item={item} />
              
              <div className="space-y-6">
                <AppearancesTab
                  comparisonSets={comparisonSets}
                  item={item}
                />
                <div className="border-b transition-colors duration-200" style={{ borderColor: 'var(--color-border)' }}>
                  <h4 className="p-4 text-lg font-semibold transition-colors duration-200" 
                      style={{ color: 'var(--color-text)' }}>
                    Review Mentions
                  </h4>
                </div>
                <CommentAppearancesTab 
                  comparisonSets={comparisonSets}
                  item={item}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default ProductDetails; 