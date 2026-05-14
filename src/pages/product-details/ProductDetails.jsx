import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../lib/apiClient';
import QuickStats from './QuickStats';
import CommentAppearancesTab from './tabs/CommentAppearancesTab';
import AppearancesTab from './tabs/AppearancesTab';
import { motion, useAnimation } from 'framer-motion';
import { useLoading } from '../../contexts/LoadingContext';
import PullToRefresh from '../../components/common/PullToRefresh';

const ProductDetails = () => {
  const { itemId } = useParams();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [reviews] = useState([]);
  const [comparisonSets, setComparisonSets] = useState([]);
  const [error, setError] = useState(null);
  const { setLoading, setError: setGlobalError } = useLoading();
  const controls = useAnimation();

  const fetchProductDetails = async () => {
    try {
      setLoading('global', true, 'Loading product details...');

      const [itemResp, setsResp] = await Promise.all([
        apiClient.get(`/api/items/${itemId}`),
        apiClient.get(`/api/items/${itemId}/sets`),
      ]);

      const itemData = itemResp.data.data;
      if (!itemData) {
        setError('Item not found');
        setGlobalError('global', 'Item not found');
        return;
      }
      setItem(itemData);
      setComparisonSets(setsResp.data.data ?? []);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err.message);
      setGlobalError('global', err.message);
    } finally {
      setLoading('global', false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [itemId]);

  const handleRefresh = async () => {
    await fetchProductDetails();
  };

  const handleSwipeRight = async (event, info) => {
    if (info.offset.x > 100) { // Only trigger if swiped more than 100px
      await controls.start({ x: '100%', transition: { duration: 0.3 } });
      navigate(-1);
    } else {
      controls.start({ x: 0, transition: { duration: 0.3 } });
    }
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
      <motion.div
        className="overflow-x-hidden"
        style={{ color: currentTheme.colors.text }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleSwipeRight}
        animate={controls}
      >
        <div className="max-w-7xl mx-auto w-full  z-10">
          <div className="" >
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
      </motion.div>
    </PullToRefresh>
  );
};

export default ProductDetails;
