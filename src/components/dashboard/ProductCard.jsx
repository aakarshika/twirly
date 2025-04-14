import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import { updateProduct, deleteProduct } from '../../services/products';
import { useNavigate } from 'react-router-dom';
const ProductCard = ({ product, onUpdate, onDelete }) => {
  const { currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ ...product });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedProduct = await updateProduct(product.id, editedProduct);
      onUpdate(updatedProduct);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(product.id);
        onDelete(product.id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };
  const navigate = useNavigate();

  const handleItemClick = () => {
    navigate(`/product/${product.id}`);
  };
  const handleCancel = () => {
    setEditedProduct({ ...product });
    setIsEditing(false);
  };

  return (
    <div 
      onClick={() => handleItemClick()}
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="relative aspect-square">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: currentTheme.colors.primary + '20' }}
          >
            <span 
              className="text-2xl font-bold"
              style={{ color: currentTheme.colors.primary }}
            >
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-2 rounded-full"
                style={{ backgroundColor: currentTheme.colors.primary }}
              >
                <Save size={16} style={{ color: currentTheme.colors.buttonText }} />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 rounded-full"
                style={{ backgroundColor: currentTheme.colors.error }}
              >
                <X size={16} style={{ color: currentTheme.colors.buttonText }} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="p-2 rounded-full"
                style={{ backgroundColor: currentTheme.colors.primary }}
              >
                <Edit2 size={16} style={{ color: currentTheme.colors.buttonText }} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-full"
                style={{ backgroundColor: currentTheme.colors.error }}
              >
                <Trash2 size={16} style={{ color: currentTheme.colors.buttonText }} />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="p-4" style={{ backgroundColor: currentTheme.colors.card }}>
        {isEditing ? (
          <input
            type="text"
            value={editedProduct.name}
            onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
            className="w-full p-2 rounded"
            style={{ 
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text
            }}
          />
        ) : (
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ color: currentTheme.colors.text }}
          >
            {product.name}
          </h3>
        )}
        
        <div className="flex justify-between items-center" >
          <span 
            className="text-sm"
            style={{ color: 'gray' }}
          >
            {product.categories?.name || 'Uncategorized'}
          </span>
          <span 
            className="text-sm font-medium"
            style={{ color: currentTheme.colors.primary }}
          >
            {product.price ? `$${product.price}` : 'No price'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 