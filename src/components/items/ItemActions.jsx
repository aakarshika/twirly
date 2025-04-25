import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ItemActions = ({ itemId }) => {
  const { theme } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Handle favorite logic here
    console.log('Favorite status:', !isFavorite);
  };

  const handleAddProduct = () => {
    // Handle add product logic here
    console.log('Adding new product to category');
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleFavorite}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
            theme === 'dark'
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
        </button>

        <button
          onClick={handleAddProduct}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
            theme === 'dark'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Add Another Product</span>
        </button>
      </div>
    </div>
  );
};

export default ItemActions; 