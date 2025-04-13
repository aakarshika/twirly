import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import ProductList from '../ProductList';
import AddProductModal from '../AddProductModal';

const ProductsTab = () => {
  const { currentTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const handleProductAdded = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  return (
    <div 
      className="p-6 rounded-lg"
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
          onClick={() => setIsModalOpen(true)}
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
      
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};

export default ProductsTab; 