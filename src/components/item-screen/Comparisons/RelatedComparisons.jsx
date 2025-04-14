import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const RelatedComparisons = ({ comparisons }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  if (!comparisons || comparisons.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>
        Related Comparisons
      </h3>
      <div className="space-y-3">
        {comparisons.map((comparison) => (
          <div
            key={comparison.id}
            className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/comparison/${comparison.id}`)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                {comparison.items?.slice(0, 3).map((item) => (
                  <div key={item.id} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <span className="font-medium" style={{ color: currentTheme.colors.text }}>
                  {comparison.title}
                </span>
                <p className="text-sm text-gray-500">
                  {comparison.items?.length} items • {comparison.vote_count} votes
                </p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedComparisons; 