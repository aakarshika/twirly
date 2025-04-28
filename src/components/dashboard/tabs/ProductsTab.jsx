import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import ProductList from '../ProductList';
import { useNavigate } from 'react-router-dom';

const ProductsTab = () => {
  const { currentTheme } = useTheme();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  return (
    <div 
      className="rounded-lg"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-xl font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Your Products
        </h2>
        <button
          onClick={() => {
            navigate('/dashboard/products/add');
          }}
          className="px-4 py-2 rounded-lg font-medium"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.buttonText
          }}
        >
          Add Product
        </button>
      </div>
      
      <ProductList products={products} setProducts={setProducts} />
      
    </div>
  );
};

export default ProductsTab; 