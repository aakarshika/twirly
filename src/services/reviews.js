import { supabase } from '../lib/supabase';

/**
 * Submit a review for an item
 * @param {number} itemId - The ID of the item being reviewed
 * @param {number} userId - The ID of the user submitting the review
 * @param {string} text - The review text
 * @param {Object} metrics - The review metrics
 * @returns {Promise<Object>} The created review and metrics
 */
export const submitReview = async (itemId, userId, text, metrics) => {
  try {
    // Start a transaction
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: userId,
          item_id: itemId,
          text: text,
          likes: 0
        }
      ])
      .select()
      .single();

    if (reviewError) throw reviewError;

    // Insert review metrics
    const metricsData = Object.entries(metrics).map(([metric_name, value]) => ({
      review_id: review.id,
      metric_name,
      value: parseFloat(value)
    }));

    const { error: metricsError } = await supabase
      .from('review_metrics')
      .insert(metricsData);

    if (metricsError) throw metricsError;


    if (updateError) throw updateError;

    return {
      review,
      metrics: metricsData
    };
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

/**
 * Like a review
 * @param {number} reviewId - The ID of the review
 * @param {number} userId - The ID of the user liking the review
 * @returns {Promise<Object>} The updated review
 */
export const likeReview = async (reviewId, userId) => {
  try {
    // Check if user has already liked the review
    const { data: existingLike, error: checkError } = await supabase
      .from('review_likes')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingLike) {
      // Unlike the review
      const { error: unlikeError } = await supabase
        .from('review_likes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', userId);

      if (unlikeError) throw unlikeError;

      const { data: review, error: updateError } = await supabase
        .from('reviews')
        .update({ likes: supabase.raw('likes - 1') })
        .eq('id', reviewId)
        .select()
        .single();

      if (updateError) throw updateError;
      return review;
    } else {
      // Like the review
      const { error: likeError } = await supabase
        .from('review_likes')
        .insert([{ review_id: reviewId, user_id: userId }]);

      if (likeError) throw likeError;

      const { data: review, error: updateError } = await supabase
        .from('reviews')
        .update({ likes: supabase.raw('likes + 1') })
        .eq('id', reviewId)
        .select()
        .single();

      if (updateError) throw updateError;
      return review;
    }
  } catch (error) {
    console.error('Error liking review:', error);
    throw error;
  }
};

/**
 * Get reviews for an item
 * @param {number} itemId - The ID of the item
 * @param {number} page - The page number (1-based)
 * @param {number} limit - Number of reviews per page
 * @returns {Promise<Object>} Object containing reviews and pagination info
 */
export const getItemReviews = async (itemId, page = 1, limit = 3) => {
  try {
    console.log('Fetching reviews for item:', itemId, 'page:', page);
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get paginated reviews for the item
    const { data: reviews, error: reviewsError, count } = await supabase
      .from('reviews')
      .select(`
        id,
        text,
        likes,
        created_at,
        updated_at,
        user_id
      `, { count: 'exact' })
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (reviewsError) throw reviewsError;
    console.log('Fetched reviews:', reviews);

    // Transform reviews to include username
    const reviewsWithUsername = reviews.map(review => ({
      ...review
    }));

    return {
      reviews: reviewsWithUsername,
      total: count,
      page,
      limit,
      hasMore: count > offset + limit
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

/**
 * Get average metrics for an item
 * @param {number} itemId - The ID of the item
 * @returns {Promise<Object>} Object containing average metrics
 */
export const getItemAverageMetrics = async (itemId) => {
  try {
    const { data, error } = await supabase
      .from('item_metric_averages')
      .select('*')
      .eq('item_id', itemId);

    if (error) throw error;

    // Transform the data into a more usable format
    const metrics = data.reduce((acc, row) => {
      acc[row.metric_name] = {
        average: row.avg_rating,
        totalReviews: row.total_reviews
      };
      return acc;
    }, {});

    return metrics;
  } catch (error) {
    console.error('Error fetching average metrics:', error);
    throw error;
  }
};

/**
 * Get all reviews written by a user with item details
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} Array of reviews with item details
 */
export const getUserReviews = async (userId) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        text,
        likes,
        created_at,
        updated_at,
        item:items (
          id,
          name,
          category:categories (
            name
          )
        ),
        review_metrics (
          metric_name,
          value
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match the UI requirements
    return reviews.map(review => ({
      id: review.id,
      productName: review.item.name,
      category: review.item.category.name,
      text: review.text,
      likes: review.likes,
      created_at: review.created_at,
      // Calculate average rating from metrics
      rating: review.review_metrics.length > 0 
        ? review.review_metrics.reduce((acc, metric) => acc + metric.value, 0) / review.review_metrics.length
        : 0
    }));
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
}; 