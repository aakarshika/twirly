import { supabase } from '../lib/supabase';
import { TEMP_USER_ID } from '../lib/constants';

/**
 * Create a new comparison set
 * @param {Object} comparisonData - The comparison set data
 * @returns {Promise<Object>} The created comparison set
 */
export const createComparisonSet = async (comparisonData) => {
  try {
    // First, create the comparison set
    const { data: comparisonSet, error: setError } = await supabase
      .from('comparison_sets')
      .insert([
        {
          name: comparisonData.name,
          user_id: TEMP_USER_ID,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (setError) throw setError;

    // Then, add the items to the comparison set
    const items = comparisonData.items.map(itemId => ({
      set_id: comparisonSet.id,
      item_id: itemId,
      created_at: new Date().toISOString()
    }));

    const { error: itemsError } = await supabase
      .from('comparison_set_items')
      .insert(items);

    if (itemsError) throw itemsError;

    return comparisonSet;
  } catch (error) {
    console.error('Error creating comparison set:', error);
    throw error;
  }
};

/**
 * Get user's comparison sets
 * @returns {Promise<Array>} List of user's comparison sets
 */
export const getUserComparisonSets = async () => {
  try {
    const { data, error } = await supabase
      .from('comparison_sets')
      .select(`
        id,
        name,
        created_at,
        user_id,
        comparison_set_items (
          id,
          item:items (
            id,
            name,
            description,
            image_url,
            price,
            user_id,
            category:categories (
              id,
              name
            )
          )
        ),
        votes (
          id,
          user_id,
          item_id
        ),
        comparison_set_comments (
          id,
          user_id,
          text,
          created_at
        )
      `)
      .eq('user_id', TEMP_USER_ID)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching comparison sets:', error);
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