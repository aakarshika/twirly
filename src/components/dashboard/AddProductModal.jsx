import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, Plus, Pencil } from 'lucide-react';
import { createProduct } from '../../services/products';
import { randomPastelColor, randomPastelColorHex } from '../../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, updateProduct } from '../../services/products';
import { useEffect } from 'react';
import { useHeader } from '../../contexts/HeaderContext';

// Validation functions
const validateName = (name) => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return 'Product name is required';
  }
  if (trimmedName.length < 3) {
    return 'Product name must be at least 3 characters long';
  }
  if (trimmedName.length > 100) {
    return 'Product name must be less than 100 characters';
  }
  // Check for special characters
  if (!/^[a-zA-Z0-9\s\-_&.,()]+$/.test(trimmedName)) {
    return 'Product name contains invalid characters';
  }
  return null;
};

const validateDescription = (description) => {
  const trimmedDesc = description.trim();
  if (!trimmedDesc) {
    return 'Product description is required';
  }
  if (trimmedDesc.length < 10) {
    return 'Description must be at least 10 characters long';
  }
  if (trimmedDesc.length > 1000) {
    return 'Description must be less than 1000 characters';
  }
  return null;
};

const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

const AddProductModal = () => {
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
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
  const [errors, setErrors] = useState({
    name: null,
    description: null
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Validate on change
    if (name === 'name') {
      setErrors(prev => ({
        ...prev,
        name: validateName(sanitizedValue)
      }));
    } else if (name === 'description') {
      setErrors(prev => ({
        ...prev,
        description: validateDescription(sanitizedValue)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const nameError = validateName(formData.name);
    const descriptionError = validateDescription(formData.description);

    setErrors({
      name: nameError,
      description: descriptionError
    });

    if (nameError || descriptionError) {
      setLoading(false);
      return;
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      setErrors(prev => ({
        ...prev,
        price: 'Price must be a valid number'
      }));
      setLoading(false);
      return;
    }

    try {
      if (id) {
        await updateProduct(id, formData, user.id);
      } else {
        const product = await createProduct({
          ...formData,
          ...(formData.category_id && { category_id: parseInt(formData.category_id) })
        }, user.id);
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.message && err.message.includes('not found')) {
        setErrors(prev => ({
          ...prev,
          general: 'The product you are trying to update no longer exists or you don\'t have permission to update it.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'Failed to save product. Please try again.'
        }));
      }
      console.error(err);
    }
    setLoading(false);
  };

  return (
      <div
        className="w-full max-w-md rounded-lg p-6"
        style={{ backgroundColor: currentTheme.colors.background,
          marginTop: isHeaderVisible ? '64px' : '0px'
         }}
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

        {errors.general && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: currentTheme.colors.error + '20',
              color: currentTheme.colors.error
            }}
          >
            {errors.general}
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
                  className={`w-full p-2 rounded ${errors.name ? 'border-red-500' : ''}`}
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text,
                    border: `1px solid ${errors.name ? currentTheme.colors.error : currentTheme.colors.border}`
                  }}
                />
                {errors.name && (
                  <p className="text-sm mt-1" style={{ color: currentTheme.colors.error }}>
                    {errors.name}
                  </p>
                )}
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
              className={`w-full p-2 rounded ${errors.description ? 'border-red-500' : ''}`}
              style={{
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${errors.description ? currentTheme.colors.error : currentTheme.colors.border}`
              }}
            />
            {errors.description && (
              <p className="text-sm mt-1" style={{ color: currentTheme.colors.error }}>
                {errors.description}
              </p>
            )}
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
              value={formData.image_url || ''}
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
              ) : id ? (
                <Pencil size={16} />
              ) : (
                <Plus size={16} />
              )}
              {id ? (<span>Update Product</span>) : (<span>Add Product</span>)}
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddProductModal; 