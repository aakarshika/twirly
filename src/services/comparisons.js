import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Create a new comparison set
 * @param {Object} comparisonData - The comparison set data
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The created comparison set
 */
export const createComparison = async (comparisonData, userId) => {
  if (!userId) {
    throw new Error('User must be logged in to create a comparison');
  }

  try {
    // Create the comparison set
    const { data: comparisonSet, error: setError } = await supabase
      .from('comparison_sets')
      .insert([{ 
        name: comparisonData.name,
        category_id: comparisonData.categoryId,
        user_id: userId
      }])
      .select()
      .single();

    if (setError) throw setError;

    // Add items to the comparison set
    const comparisonSetItems = comparisonData.items.map(item => ({
      set_id: comparisonSet.id,
      item_id: item.id
    }));

    const { error: itemsError } = await supabase
      .from('comparison_set_items')
      .insert(comparisonSetItems)
      .select();

    if (itemsError) throw itemsError;

    // Fetch the complete comparison set with items
    const { data: completeComparison, error: fetchError } = await supabase
      .from('comparison_sets')
      .select(`
        *,
        items:comparison_set_items(
          item:items(*)
        ),
        votes(*),
        comments:comparison_set_comments(*)
      `)
      .eq('id', comparisonSet.id)
      .single();

    if (fetchError) throw fetchError;

    return completeComparison;
  } catch (error) {
    console.error('Error creating comparison:', error);
    throw error;
  }
};

/**
 * Get user's comparison sets
 * @returns {Promise<Array>} List of user's comparison sets
 */
export const getComparisons = async (categoryId = null) => {
  try {
    let query = supabase
      .from('comparison_sets')
      .select(`
        *,
        items:comparison_set_items(
          item:items(*)
        ),
        votes(*),
        comments:comparison_set_comments(*)
      `)
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching comparisons:', error);
    throw error;
  }
};

/**
 * Get user's comparison sets
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} List of user's comparison sets
 */
export const getUserComparisons = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to fetch comparisons');
  }

  try {
    const { data, error } = await supabase
      .from('comparison_sets')
      .select(`
        *,
        items:comparison_set_items(
          item:items(*)
        ),
        votes(*),
        comments:comparison_set_comments(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user comparisons:', error);
    throw error;
  }
};

/**
 * Add items to a comparison set
 * @param {number} setId - The ID of the comparison set
 * @param {Array<number>} itemIds - Array of item IDs to add
 * @returns {Promise<void>}
 */
export const addItemsToComparisonSet = async (setId, itemIds) => {
  try {
    const items = itemIds.map(itemId => ({
      comparison_set_id: setId,
      item_id: itemId,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('comparison_set_items')
      .insert(items);

    if (error) throw error;
  } catch (error) {
    console.error('Error adding items to comparison set:', error);
    throw error;
  }
};

/**
 * Delete a comparison set
 * @param {number} setId - The ID of the comparison set to delete
 * @returns {Promise<void>}
 */
export const deleteComparisonSet = async (setId) => {
  try {
    const { error } = await supabase
      .from('comparison_sets')
      .delete()
      .eq('id', setId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting comparison set:', error);
    throw error;
  }
}; 