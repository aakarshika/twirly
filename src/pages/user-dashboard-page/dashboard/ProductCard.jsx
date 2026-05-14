import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { deleteProduct } from '../../../services/products';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../../../components/common/common-cards/ItemCard';
import { useTheme } from '../../../contexts/ThemeContext';
import ItemCardEditable from '../../comparison-aspect-page/ComparisonItemCard/ItemCardEditable';
const ProductCard = ({ product, onUpdate, onDelete, isPublic }) => {
  const { currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [, setEditedProduct] = useState({ ...product });

  const handleEdit = () => {
    setIsEditing(true);
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

  const _handleItemClick = () => {
    navigate(`/item/${product.id}`);
  };
  const _handleCancel = () => {
    setEditedProduct({ ...product });
    setIsEditing(false);
  };

  return (
    <div>
    <div
      // onClick={() => handleItemClick()}
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="relative">
        <ItemCard item={product} />
        {(!isPublic && <div className="absolute top-2 right-2 flex space-x-2 z-12">
          <button
            onClick={() => {
              handleEdit();
            }}
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
        </div>)}
      </div>

    </div>
    {isEditing &&

     <div>

    <ItemCardEditable item={product} onSave={updatedProduct => {
      onUpdate(updatedProduct);
      setIsEditing(false);
    }} onCancel={() => setIsEditing(false)} />
    </div>}
    </div>
  );
};

export default ProductCard;
