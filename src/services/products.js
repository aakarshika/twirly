import { supabase } from '../lib/supabase';
import { TEMP_USER_ID } from '../lib/constants';

/**
 * Get user's products with their metrics
 * @returns {Promise<Array>} List of user's products
 */
export const getUserProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        item_metrics (
          views,
          comparisons,
          reviews,
          rating
        ),
        categories (
          name
        )
      `)
      .eq('user_id', TEMP_USER_ID)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user products:', error);
    throw error;
  }
};

/**
 * Update a product
 * @param {number} productId - The ID of the product to update
 * @param {Object} productData - The updated product data
 * @returns {Promise<Object>} The updated product
 */
export const updateProduct = async (productId, productData) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .update({
        ...productData,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product
 * @param {number} productId - The ID of the product to delete
 * @returns {Promise<void>}
 */
export const deleteProduct = async (productId) => {
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', productId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Create a new product
 * @param {Object} productData - The product data to create
 * @returns {Promise<Object>} The created product
 */
export const createProduct = async (productData) => {
  try {
    // Clean up the data - convert empty strings to null for optional fields
    const cleanedData = {
      ...productData,
      user_id: TEMP_USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_id: productData.category_id || null,
      price: productData.price ? parseFloat(productData.price) : null
    };

    const { data, error } = await supabase
      .from('items')
      .insert([cleanedData])
      .select()
      .single();

    if (error) throw error;

    // Create initial metrics for the product
    await supabase
      .from('item_metrics')
      .insert([
        {
          item_id: data.id,
          views: 0,
          comparisons: 0,
          reviews: 0,
          rating: 0
        }
      ]);

    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Search for products by name
 * @param {string} query - The search query
 * @returns {Promise<Array>} List of matching products
 */
export const searchProducts = async (query) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        categories (
          name
        )
      `)
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}; 