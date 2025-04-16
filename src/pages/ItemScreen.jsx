import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import ItemHeader from '../components/item-screen/ItemHeader';
import ItemDetails from '../components/item-screen/ItemDetails';
import Ratings from '../components/item-screen/Ratings';
import Comparisons from '../components/item-screen/Comparisons';
import Reviews from '../components/item-screen/Reviews';
import RelatedProducts from '../components/item-screen/RelatedProducts';

const ItemScreen = () => {
  const { itemId } = useParams();
  const { currentTheme } = useTheme();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        // Fetch item details with all related data
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select(`
            *,
            categories (*),
            reviews (*),
            comparison_set_items (
              *,
              comparison_sets (*)
            )
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
        setReviews(itemData.reviews || []);
        setComparisons(itemData.comparison_set_items || []);

        // Fetch related products from the same category
        const { data: relatedData, error: relatedError } = await supabase
          .from('items')
          .select('*')
          .eq('category_id', itemData.category_id)
          .neq('id', itemId)
          .limit(4);

        if (relatedError) throw relatedError;
        setRelatedProducts(relatedData || []);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchItemData();
  }, [itemId]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!item) return <div className="p-4">Product not found</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ItemHeader item={item} />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ItemDetails item={item} />
            <Ratings item={item} reviews={reviews} />
            <Comparisons comparisons={comparisons} />
          </div>
          <div className="lg:col-span-1">
            <RelatedProducts products={relatedProducts} />
            <Reviews reviews={reviews} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemScreen; 