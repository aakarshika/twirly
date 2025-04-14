import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const RelatedProducts = ({ products }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
        Related Products
      </h2>
      <div className="flex overflow-x-auto pb-4 space-x-4">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64">
            <ProductCard
              product={product}
              onClick={() => navigate(`/item/${product.id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts; 