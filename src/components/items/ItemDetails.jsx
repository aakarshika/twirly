import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ItemDetails = ({ itemId }) => {
  const { theme } = useTheme();
  // This would be fetched from your API
  const item = {
    name: 'Sample Item',
    description: 'This is a detailed description of the item. It can be quite long and contain multiple paragraphs.',
    price: '$99.99',
    category: 'Electronics',
    tags: ['featured', 'popular', 'new'],
    descriptors: ['High Quality', 'Durable', 'Eco-friendly', 'Modern Design', 'User-friendly']
  };

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <div className="space-y-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {item.name}
          </h1>
          {item.price && (
            <p className={`text-xl mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {item.price}
            </p>
          )}
        </div>

        <div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {item.description}
          </p>
        </div>

        {item.category && (
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Category:
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
            }`}>
              {item.category}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {item.descriptors.map((descriptor, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm ${
                theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {descriptor}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded text-xs ${
                theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails; 