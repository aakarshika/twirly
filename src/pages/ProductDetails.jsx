import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { StarIcon, HandThumbUpIcon } from '@heroicons/react/24/solid';

const ProductDetails = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comparisonSets, setComparisonSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // Fetch item details with company and category info
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select(`
            *,
            categories (*),
            item_metrics (*)
          `)
          .eq('id', itemId)
          .single();

        if (itemError) throw itemError;
        setItem(itemData);

        // Fetch reviews with user info and metrics
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            users (username),
            review_metrics (*),
            review_likes (*)
          `)
          .eq('item_id', itemId)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData);

        // Fetch comparison sets where this item appears
        const { data: setsData, error: setsError } = await supabase
          .from('comparison_set_items')
          .select(`
            comparison_sets (*)
          `)
          .eq('item_id', itemId);

        if (setsError) throw setsError;

        // Fetch votes for each comparison set
        const votesPromises = setsData.map(async (set) => {
          const { data: votesData, error: votesError } = await supabase
            .from('votes')
            .select('count')
            .eq('set_id', set.comparison_sets.id);

          if (votesError) throw votesError;
          return { ...set, votes: votesData };
        });

        const comparisonSetsWithVotes = await Promise.all(votesPromises);
        setComparisonSets(comparisonSetsWithVotes);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [itemId]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!item) return <div className="p-4">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Product Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
          <p className="text-gray-600 mb-4">{item.description}</p>
          {item.price && (
            <p className="text-2xl font-semibold mb-4">${item.price}</p>
          )}
          {item.categories && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Category</h2>
              <p className="text-gray-700">{item.categories.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{review.users.username}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1">
                    {review.review_metrics?.[0]?.value || 'N/A'}
                  </span>
                </div>
              </div>
              <p className="mb-2">{review.text}</p>
              <div className="flex items-center text-gray-500">
                <HandThumbUpIcon className="h-4 w-4 mr-1" />
                <span>{review.review_likes?.length || 0} likes</span>
              </div>
              {/* Metrics Section */}
              <div className="review-metrics mt-2">
                <strong>Metrics:</strong>
                {Array.isArray(review.review_metrics) && review.review_metrics.length > 0 ? (
                  <div className="mt-2">
                    {review.review_metrics.map(metric => (
                      <div key={metric.id} className="metric-item text-gray-400">
                        <span>{metric.metric_name}: <strong>{metric.value}</strong></span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No metrics available</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Sets Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Appears in Comparisons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonSets.map((set) => (
            <div key={set.comparison_sets.id} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{set.comparison_sets.name}</h3>
              <p className="text-sm text-gray-500">
                Votes: {set.votes?.count || 0}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 