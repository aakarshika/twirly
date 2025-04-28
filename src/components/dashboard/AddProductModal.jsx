import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, Plus } from 'lucide-react';
import { createProduct } from '../../services/products';
import { randomPastelColor, randomPastelColorHex } from '../../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, updateProduct } from '../../services/products';
import { useEffect } from 'react';

const AddProductModal = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price: '',
    category_id: '',
    item_color_string: randomPastelColorHex()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const product = await getProduct(id);
      setFormData(product);
    } catch (err) {
      console.error(err);
    }
  };
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
      if (id) {
        await updateProduct(id,  formData);
      } else {
        const product = await createProduct({
          ...formData,
          // Only include category_id if they have values
          ...(formData.category_id && { category_id: parseInt(formData.category_id) })
        }, user.id);
      }
    } catch (err) {
      setError('Failed to create product. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
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
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
              <div
                className="w-16 h-16 rounded flex items-center justify-center"
                style={{ backgroundColor: formData.item_color_string }}
              >

                {/* add color picker, and color picker input */}
                <div className="z-10">
                  <input
                    type="color"
                    name="item_color_string"
                    value={formData.item_color_string}
                    onChange={handleChange}
                    className="w-16 h-16 opacity-0"
                  />
                </div>
                <p style={{ color: currentTheme.colors.text }} className="absolute text-white text-2xl font-bold">{formData.name.charAt(0).toUpperCase()}</p>
              </div>

              </div>
              <div className="flex-1">
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
            </div>
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

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                navigate('/dashboard');
              }}
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
  );
};

export default AddProductModal; 