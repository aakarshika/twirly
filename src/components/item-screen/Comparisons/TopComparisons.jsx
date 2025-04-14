import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const TopComparisons = ({ comparisons }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  if (!comparisons || comparisons.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>
        Top Comparisons
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisons.map((comparison) => (
          <div key={comparison.id} className="bg-white rounded-lg shadow-sm p-4">
            <h4 className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>
              {comparison.name}
            </h4>
            <div className="flex items-center space-x-2">
              {comparison.items?.map((item) => (
                <div key={`${comparison.id}-${item.id}`} className="w-10 h-10 rounded-full overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      if (e.target.src !== 'https://fakeimg.pl/600x400?text=img') {
                        e.target.src = 'https://fakeimg.pl/600x400?text=img';
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopComparisons; 