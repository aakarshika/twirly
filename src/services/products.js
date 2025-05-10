import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';


/**
 * Get a product by ID
 * @param {number} productId - The ID of the product to get
 * @returns {Promise<Object>} The product
 */
export const getProduct = async (productId) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) throw error;
  return data;
};
/**
 * Get user's products with their metrics
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} List of user's products
 */
export const getUserProducts = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to fetch products');
  }

  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        categories (
          name
        )
      `)
      .eq('user_id', userId)
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
 * @param {string} userId - The ID of the user updating the product
 * @returns {Promise<Object>} The updated product
 */
export const updateProduct = async (productId, productData, userId) => {
  if (!userId) {
    throw new Error('User ID is required to update a product');
  }

  try {
    // First check if the product exists and belongs to the user
    const { data: existingProduct, error: checkError } = await supabase
      .from('items')
      .select('*')
      .eq('id', productId)
      .eq('user_id', userId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        throw new Error(`Product with ID ${productId} not found or you don't have permission to update it`);
      }
      throw checkError;
    }

    // If product exists and belongs to user, proceed with update
    const { data, error } = await supabase
      .from('items')
      .update({
        ...productData,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .eq('user_id', userId)  // Add this to ensure user can only update their own items
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
 * @param {string} userId - The ID of the user creating the product
 * @returns {Promise<Object>} The created product
 */
export const createProduct = async (productData, userId) => {
  if (!userId) {
    throw new Error('User must be logged in to create a product');
  }

  try {
    // Clean up the data - convert empty strings to null for optional fields
    const cleanedData = {
      ...productData,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_id: productData.category_id || null,
      price: productData.price ? parseFloat(productData.price) : null
    };

    // Remove any id field if it exists
    delete cleanedData.id;

    const { data, error } = await supabase
      .from('items')
      .insert([cleanedData])
      .select()
      .single();

    if (error) throw error;

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
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(5);

  if (error) throw error;
  return data;
}; 

//  search categories
/*
*/
export const searchCategories = async (query) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(5);

  if (error) throw error;
  return data;
};
