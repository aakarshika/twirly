import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { RadarChart } from '../../results/visualizations';
import { UserGroupIcon, ChatBubbleOvalLeftIcon, StarIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const AppearancesTab = ({ comparisonSets, item }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalLikes = reviews.reduce((sum, review) => sum + (review.likes || 0), 0);
    return totalLikes / reviews.length;
  };

  const calculateMetricAverages = (reviews, aspects) => {
    if (!reviews || !aspects || reviews.length === 0) return [];
    
    return aspects.map(aspect => {
      const metricValues = reviews.flatMap(review => 
        review.review_metrics
          ?.filter(metric => metric.metric_name === aspect.metric_name)
          .map(metric => metric.value) || []
      );
      
      const average = metricValues.length > 0 
        ? metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length 
        : 0;
      
      return {
        name: aspect.metric_name,
        average: average,
        description: aspect.description
      };
    });
  };

  // Helper function to group reviews by item_id
  const groupReviewsByItem = (reviews) => {
    if (!reviews) return {};
    return reviews.reduce((acc, review) => {
      if (!acc[review.item_id]) {
        acc[review.item_id] = [];
      }
      acc[review.item_id].push(review);
      return acc;
    }, {});
  };

  return (
    <div className="space-y-4">
      {comparisonSets?.map((set) => {
        console.log('Comparison Set:', set);
        console.log('Reviews:', set.reviews);
        
        const reviewsByItem = groupReviewsByItem(set.reviews);
        console.log('Reviews by Item:', reviewsByItem);
        
        const metricAverages = calculateMetricAverages(set.reviews, set.aspects);
        
        return (
          <div 
            key={set.id} 
            className="flex flex-col p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
            style={{ backgroundColor: currentTheme.colors.background }}
            onClick={() => navigate(`/comparison/${set.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg hover:text-blue-400 transition-colors"
                style={{ color: currentTheme.colors.text }}
              >
                {set.name}
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1.5 opacity-60" />
                  <div className="flex items-baseline">
                    <span className="text-base font-semibold mr-1">
                      {set.votes?.length || 0}
                    </span>
                    <span className="text-xs opacity-60">/</span>
                    <span className="text-sm ml-1">
                      {set.totalVotes || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center" style={{ color: currentTheme.colors.textSecondary }}>
                  <ChatBubbleOvalLeftIcon className="h-4 w-4 mr-1.5" />
                  <span className="text-sm">{set.comments?.length || 0} </span>
                </div>
              </div>
            </div>


            {metricAverages.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metricAverages.map((metric) => (
                    <div key={metric.name} className="flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                          {metric.name}
                        </span>
                        <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                          {metric.average.toFixed(1)}/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(metric.average / 5) * 100}%` }}
                        />
                      </div>
                      {metric.description && (
                        <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                          {metric.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}


            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Performance Analysis
              </h4>
              <div className="h-[200px]">
                <RadarChart 
                  item={item} 
                  comparisonSets={[{
                    id: set.id,
                    name: set.name,
                    aspects: set.aspects,
                    items: Object.entries(reviewsByItem).map(([itemId, reviews]) => ({
                      id: itemId,
                      name: reviews[0]?.items?.name || `Item ${itemId}`,
                      reviews: reviews
                    }))
                  }]}
                />
              </div>
            </div>
          </div>
        );
      })}
      {(!comparisonSets || comparisonSets.length === 0) && (
        <div className="text-center py-8">
          <p className="text-lg" style={{ color: currentTheme.colors.textSecondary }}>
            No comparison history available
          </p>
        </div>
      )}
    </div>
  );
};

export default AppearancesTab; 