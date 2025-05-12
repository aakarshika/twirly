import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';


/**
 * Get a product by ID
 * @param {number} productId - The ID of the product to get
 * @returns {Promise<Object>} The product
 */
export const getProduct = async (productId) => {
  try {
    // Get the product
    const { data: product, error: productError } = await supabase
      .from('items')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    // Get the categories
    const { data: categories, error: categoriesError } = await supabase
      .from('item_categories')
      .select(`
        category_id,
        categories (
          id,
          name,
          description
        )
      `)
      .eq('item_id', productId);

    if (categoriesError) throw categoriesError;

    // Transform the categories data
    const transformedCategories = categories.map(c => c.categories);

    return {
      ...product,
      categories: transformedCategories
    };
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
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
        categories!item_categories (
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
    throw new Error('User must be logged in to update a product');
  }

  try {
    // Clean up the data
    const cleanedData = {
      ...productData,
      updated_at: new Date().toISOString(),
      price: productData.price ? parseFloat(productData.price) : null
    };

    // Remove fields that shouldn't be updated directly
    delete cleanedData.id;
    delete cleanedData.created_at;
    delete cleanedData.user_id;
    delete cleanedData.categories;
    delete cleanedData.category_ids;

    // Start a transaction
    const { data: product, error: productError } = await supabase
      .from('items')
      .update(cleanedData)
      .eq('id', productId)
      .eq('user_id', userId)
      .select()
      .single();

    if (productError) throw productError;

    // Update category mappings
    if (productData.category_ids) {
      // First, delete existing mappings
      const { error: deleteError } = await supabase
        .from('item_categories')
        .delete()
        .eq('item_id', productId);

      if (deleteError) throw deleteError;

      // Then, create new mappings
      if (productData.category_ids.length > 0) {
        const categoryMappings = productData.category_ids.map(categoryId => ({
          item_id: productId,
          category_id: categoryId,
          created_at: new Date().toISOString()
        }));

        const { error: mappingError } = await supabase
          .from('item_categories')
          .insert(categoryMappings);

        if (mappingError) throw mappingError;
      }
    }

    return product;
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
      price: productData.price ? parseFloat(productData.price) : null
    };

    // Remove any id field if it exists
    delete cleanedData.id;
    delete cleanedData.categories;
    delete cleanedData.category_ids;

    // Start a transaction
    const { data: product, error: productError } = await supabase
      .from('items')
      .insert([cleanedData])
      .select()
      .single();

    if (productError) throw productError;

    // If there are categories, create the mappings
    if (productData.category_ids && productData.category_ids.length > 0) {
      const categoryMappings = productData.category_ids.map(categoryId => ({
        item_id: product.id,
        category_id: categoryId,
        created_at: new Date().toISOString()
      }));

      const { error: mappingError } = await supabase
        .from('item_categories')
        .insert(categoryMappings);

      if (mappingError) throw mappingError;
    }

    return product;
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
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
};
