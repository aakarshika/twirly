import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Create a new comparison set with items and aspects
 * @param {Object} comparisonData - The comparison set data
 * @returns {Promise<Object>} The created comparison set
 */
export const createComparison = async (comparisonData) => {
  const { data: comparison, error: comparisonError } = await supabase
    .from('comparison_sets')
    .insert([
      {
        name: comparisonData.title,
        description: comparisonData.description,
        category_id: comparisonData.category_id,
        user_id: comparisonData.user_id,
        is_published: comparisonData.isPublished
      }
    ])
    .select()
    .single();

  if (comparisonError) throw comparisonError;

  // Insert comparison set items
  const { error: itemsError } = await supabase
    .from('comparison_set_items')
    .insert(
      comparisonData.items.map(item => ({
        set_id: comparison.id,
        item_id: item.id
      }))
    );

  if (itemsError) throw itemsError;

  // Insert comparison set aspects
  const { error: aspectsError } = await supabase
    .from('comparison_set_aspects')
    .insert(
      comparisonData.aspects.map(aspect => ({
        set_id: comparison.id,
        metric_name: aspect.metric_name,
        description: aspect.description
      }))
    );

  if (aspectsError) throw aspectsError;

  return comparison;
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
  const { data, error } = await supabase
    .from('comparison_sets')
    .select(`
      *,
      items:comparison_set_items (
        item_id,
        id,
        item:items(*)
      ),
      comments:comparison_set_comments(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};


/**
 * Delete a comparison set
 * @param {number} setId - The ID of the comparison set to delete
 * @returns {Promise<void>}
 */
export const deleteComparisonSet = async (setId) => {
  const { error } = await supabase
    .from('comparison_sets')
    .delete()
    .eq('id', setId);

  if (error) throw error;
};

/**
 * Get a comparison by ID
 * @param {number} id - The ID of the comparison to get
 * @returns {Promise<Object>} The comparison object
 */
export const getComparison = async (id, userId) => {



  try {
    const { data, error } = await supabase
      .from('comparison_sets')
      .select(`
      *,
      comparison_set_items (
        item_id,
        items (*
        )
      ),
      comparison_set_aspects (
        id,
        metric_name,
        description,
        weight
      )
    `)
    .eq('user_id', userId)
    .eq('id', id)
      .single();
    if (error) throw error;
    // console.log(data, 'data', id);
    return data;
  } catch (error) {
    console.error('Error fetching comparisons:', error);
    throw error;
  }
};

/**
 * Get user's unpublished comparison set
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object|null>} The unpublished comparison set or null if none exists
 */
export const getUnpublishedComparison = async (userId) => {
  const { data, error } = await supabase
    .from('comparison_sets')
    .select(`
      *,
      comparison_set_items (
        item_id,
        items (*
        )
      ),
      comparison_set_aspects (
        id,
        metric_name,
        description,
        weight
      )
    `)
    .eq('user_id', userId)
    .eq('is_published', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" error
  return data || null;
};

/**
 * Update an existing comparison set
 * @param {number} setId - The ID of the comparison set to update
 * @param {Object} comparisonData - The updated comparison set data
 * @returns {Promise<Object>} The updated comparison set
 */
export const updateComparison = async (setId, comparisonData) => {
  // Update the comparison set
  const { data: comparison, error: comparisonError } = await supabase
    .from('comparison_sets')
    .update({
      name: comparisonData.title,
      description: comparisonData.description,
      category_id: comparisonData.category_id,
      is_published: comparisonData.isPublished
    })
    .eq('id', setId)
    .select()
    .single();

  if (comparisonError) throw comparisonError;

  // Get existing items and aspects
  const { data: existingItems, error: existingItemsError } = await supabase
    .from('comparison_set_items')
    .select('id, item_id')
    .eq('set_id', setId);

  if (existingItemsError) throw existingItemsError;

  const { data: existingAspects, error: existingAspectsError } = await supabase
    .from('comparison_set_aspects')
    .select('id')
    .eq('set_id', setId);

  if (existingAspectsError) throw existingAspectsError;

  // Delete items that are no longer in the comparison
  const itemsToDelete = existingItems
    .filter(existing => !comparisonData.items.some(item => item.id === existing.item_id))
    .map(item => item.id);

  if (itemsToDelete.length > 0) {
    const { error: deleteItemsError } = await supabase
      .from('comparison_set_items')
      .delete()
      .in('id', itemsToDelete);

    if (deleteItemsError) throw deleteItemsError;
  }

  // Add new items
  const itemsToAdd = comparisonData.items
    .filter(item => !existingItems.some(existing => existing.item_id === item.id))
    .map(item => ({
      set_id: setId,
      item_id: item.id
    }));

  if (itemsToAdd.length > 0) {
    const { error: addItemsError } = await supabase
      .from('comparison_set_items')
      .insert(itemsToAdd);

    if (addItemsError) throw addItemsError;
  }

  // Delete aspects that are no longer in the comparison
  const aspectsToDelete = existingAspects
    .filter(existing => !comparisonData.aspects.some(aspect => aspect.id === existing.id))
    .map(aspect => aspect.id);

  // Add new aspects
  const aspectsToAdd = comparisonData.aspects
    .filter(aspect => !existingAspects.some(existing => existing.id === aspect.id))
    .map(aspect => ({
      set_id: setId,
      metric_name: aspect.metric_name,
      description: aspect.description,
      weight: aspect.weight
    }));

    
  // Update existing aspects
  const aspectsToUpdate = comparisonData.aspects
    .filter(aspect => existingAspects.some(existing => existing.id === aspect.id))
    .map(aspect => ({
      id: aspect.id,
      set_id: setId,
      metric_name: aspect.metric_name,
      description: aspect.description,
      weight: aspect.weight
    }));


  // console.log(aspectsToDelete, 'aspectsToDelete');
  // console.log(aspectsToAdd, 'aspectsToAdd');
  // console.log(aspectsToUpdate, 'aspectsToUpdate');
  if (aspectsToDelete.length > 0) {
    const { error: deleteAspectsError } = await supabase
      .from('comparison_set_aspects')
      .delete()
      .in('id', aspectsToDelete);

    if (deleteAspectsError) throw deleteAspectsError;
  }

  if (aspectsToAdd.length > 0) {
    const { error: addAspectsError } = await supabase
      .from('comparison_set_aspects')
      .insert(aspectsToAdd);

    if (addAspectsError) throw addAspectsError;
  }

  if (aspectsToUpdate.length > 0) {
    const { error: updateAspectsError } = await supabase
      .from('comparison_set_aspects')
      .upsert(aspectsToUpdate);

    if (updateAspectsError) throw updateAspectsError;
  }

  return comparison;
}; 