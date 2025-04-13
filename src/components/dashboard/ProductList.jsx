import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ProductCard from './ProductCard';
import { getUserProducts } from '../../services/products';

const ProductList = ({ products, setProducts }) => {
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getUserProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [setProducts]);

  const handleProductUpdate = (updatedProduct) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
  };

  const handleProductDelete = (productId) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div 
            key={index}
            className="rounded-lg overflow-hidden animate-pulse"
            style={{ backgroundColor: currentTheme.colors.cardBackground }}
          >
            <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
            <div className="p-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="p-4 rounded-lg text-center"
        style={{ backgroundColor: currentTheme.colors.error + '20' }}
      >
        <p style={{ color: currentTheme.colors.error }}>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div 
        className="p-8 rounded-lg text-center"
        style={{ backgroundColor: currentTheme.colors.cardBackground }}
      >
        <p style={{ color: currentTheme.colors.textSecondary }}>
          No products found. Add your first product to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onUpdate={handleProductUpdate}
          onDelete={handleProductDelete}
        />
      ))}
    </div>
  );
};

export default ProductList; 