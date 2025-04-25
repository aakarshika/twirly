import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const SimilarItems = ({ itemId }) => {
  const { theme } = useTheme();

  // This would be fetched from your API
  const similarItems = [
    {
      id: 1,
      name: 'Similar Item 1',
      image: 'https://via.placeholder.com/150',
      descriptors: ['Reliable', 'Durable', 'Modern'],
      comparisonCount: 15,
      winRate: 65
    },
    {
      id: 2,
      name: 'Similar Item 2',
      image: 'https://via.placeholder.com/150',
      descriptors: ['Innovative', 'Efficient', 'User-friendly'],
      comparisonCount: 12,
      winRate: 55
    },
    {
      id: 3,
      name: 'Similar Item 3',
      image: 'https://via.placeholder.com/150',
      descriptors: ['High Quality', 'Affordable', 'Popular'],
      comparisonCount: 20,
      winRate: 70
    }
  ];

  const SimilarItemCard = ({ item }) => (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <div className="flex items-start space-x-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {item.name}
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {item.descriptors.map((descriptor, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {descriptor}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.comparisonCount} comparisons
              </span>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.winRate}% win rate
              </span>
            </div>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Compare
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Similar Items
      </h2>
      <div className="space-y-4">
        {similarItems.map((item) => (
          <SimilarItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default SimilarItems; 