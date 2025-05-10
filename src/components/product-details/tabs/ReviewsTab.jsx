import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { HeatMap } from '../../results/visualizations';
import { ThumbsUp } from 'lucide-react';
import { getPublicUrl } from '../../../lib/utils';

const ReviewsTab = ({ reviews,  hasMoreReviews, loadingReviews, loadMoreReviews}) => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBackground }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Top Reviews</h3>
          <div className="space-y-4">
            {reviews?.slice(0, 3).map((review) => (
              <div key={review.id} className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-700 mr-2">
                    <img src={getPublicUrl(review.user_preferences?.profile_image_url || '/default-avatar.png')} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: currentTheme.colors.textSecondary }}>{review.user_preferences?.username || 'Anonymous'}</p>
                    <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm " style={{ color: currentTheme.colors.text }}>{review.text}</p>
                <div className="flex items-center mt-2">
                  <ThumbsUp className="w-4 h-4 mr-1" style={{ color: currentTheme.colors.primary }} />
                  <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                    {review.likes || 0} likes
                  </span>
                </div>
              </div>
            ))}
            {(!reviews || reviews.length === 0) && (
              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                No reviews to display
              </p>
            )}

            {hasMoreReviews && !loadingReviews && (
              <button
                onClick={loadMoreReviews}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
              >
                Load More Reviews
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsTab; 