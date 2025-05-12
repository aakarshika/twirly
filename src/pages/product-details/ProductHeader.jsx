import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ProductHeader = ({ item }) => {
  const { currentTheme } = useTheme();

  if (!item) return null;

  return (
    <div className="flex flex-col items-center">
      <div>
        {item.image_url && (
          <img

            src={item.image_url}
            alt={item.name}
            className="w-auto h-auto rounded-lg shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              if (e.target.src !== 'https://fakeimg.pl/600x400?text=img') {
                e.target.src = 'https://fakeimg.pl/600x400?text=img';
              }
            }}
          />
        )}
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: currentTheme.colors.text }}>{item.name}</h1>
        <p className="text-gray-600 mb-4" style={{ color: currentTheme.colors.textSecondary }}>{item.description}</p>
        {item.price && (
          <p className="text-2xl font-semibold mb-4" style={{ color: currentTheme.colors.text }}>${item.price}</p>
        )}
        {item.categories && (
          <div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>Category</h2>
            <p className="text-gray-700" style={{ color: currentTheme.colors.textSecondary }}>{item.categories.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductHeader; 