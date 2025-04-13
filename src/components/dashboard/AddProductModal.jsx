import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Plus } from 'lucide-react';
import { createProduct } from '../../services/products';

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const { currentTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price: '',
    category_id: '',
    company_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Product description is required');
      setLoading(false);
      return;
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      setError('Price must be a valid number');
      setLoading(false);
      return;
    }

    try {
      const product = await createProduct({
        ...formData,
        // Only include category_id and company_id if they have values
        ...(formData.category_id && { category_id: parseInt(formData.category_id) }),
        ...(formData.company_id && { company_id: parseInt(formData.company_id) })
      });
      onProductAdded(product);
      onClose();
    } catch (err) {
      setError('Failed to create product. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-lg p-6"
        style={{ backgroundColor: currentTheme.colors.background }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 
            className="text-xl font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            Add New Product
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div 
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ 
              backgroundColor: currentTheme.colors.error + '20',
              color: currentTheme.colors.error
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: currentTheme.colors.text }}
            >
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: currentTheme.colors.text }}
            >
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: currentTheme.colors.text }}
            >
              Image URL
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: currentTheme.colors.text }}
            >
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: currentTheme.colors.text }}
            >
              Category ID (Optional)
            </label>
            <input
              type="number"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              min="1"
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: currentTheme.colors.text }}
            >
              Company ID (Optional)
            </label>
            <input
              type="number"
              name="company_id"
              value={formData.company_id}
              onChange={handleChange}
              min="1"
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              style={{ 
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.buttonText,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus size={16} />
              )}
              <span>Add Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal; 