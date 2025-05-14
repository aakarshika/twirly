import React, { useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import ProductList from '../ProductList';
import { useNavigate } from 'react-router-dom';
import ItemCardEditable from '../../../comparison-aspect-page/ComparisonItemCard/ItemCardEditable';

const ProductsTab = ({ userId, isPublic }) => {
  const { currentTheme } = useTheme();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);

  const handleProductUpdate = (updatedProduct) => {
    console.log('updatedProduct', updatedProduct);
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
    console.log('products', products);
  };

  const handleProductDelete = (productId) => {
    console.log('productId', productId);
    setProducts(products.filter(product => product.id !== productId));
    console.log('products', products);
  };

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
          {isPublic ? 'Products' : 'Your Products'}
        </h2>
        {(!isPublic && <button
          onClick={() => {
            setAddProductModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg font-medium"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.buttonText
          }}
        >
          Add Product
        </button>)}
      </div>
      
      <ProductList 
        products={products} 
        setProducts={setProducts} 
        userId={userId} 
        isPublic={isPublic} 
        onUpdate={handleProductUpdate}
        onDelete={handleProductDelete}
      />

      {addProductModalOpen && 
      <ItemCardEditable 
        item={{}}
        onSave={(item) => {
          setProducts([item, ...products]);
          setAddProductModalOpen(false);
        }}
        onCancel={() => setAddProductModalOpen(false)}
      />}
    </div>
  );
};

export default ProductsTab; 