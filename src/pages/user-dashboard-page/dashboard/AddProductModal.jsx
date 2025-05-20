import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect } from 'react';
import { X, Plus, Pencil, Upload, Search, Info } from 'lucide-react';
import { createProduct, searchCategories, createCategory } from '../../../services/products';
import { randomPastelColor, randomPastelColorHex } from '../../../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, updateProduct } from '../../../services/products';
import { useHeader } from '../../../contexts/HeaderContext';
import { supabase } from '../../../lib/supabase';
import VotedCard from '../../comparison-aspect-page/ComparisonItemCard/VotedCard';
import ItemCardEditable from '../../comparison-aspect-page/ComparisonItemCard/ItemCardEditable';

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
  // if (trimmedDesc.length < 10) {
  //   return 'Description must be at least 10 characters long';
  // }
  if (trimmedDesc.length > 1000) {
    return 'Description must be less than 1000 characters';
  }
  return null;
};

const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Only remove < and > characters
    .replace(/\s{2,}/g, ' '); // Replace multiple spaces with single space
};

// Add a default image URL (use the same as ProductCard/ItemCard)
const DEFAULT_IMAGE_URL = '/images/default-product-image.png';

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
    categories: [],
    item_color_string: randomPastelColorHex()
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: null,
    description: null,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryResults, setCategoryResults] = useState([]);
  const [showCategorySearch, setShowCategorySearch] = useState(false);
  const fileInputRef = React.useRef(null);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    const searchCategoriesDebounced = async () => {
      if (categorySearch.length > 2) {
        try {
          const results = await searchCategories(categorySearch);
          setCategoryResults(results);
        } catch (error) {
          console.error('Error searching categories:', error);
        }
      } else {
        setCategoryResults([]);
      }
    };

    const timeoutId = setTimeout(searchCategoriesDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [categorySearch]);

  const fetchProduct = async () => {
    try {
      const product = await getProduct(id);
      
      // If there's an image URL, get the public URL
      if (product.image_url) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-pics')
          .getPublicUrl(product.image_url);
        setImagePreview(publicUrl);
      }
      
      setFormData(product);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      // Create a unique file name using timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      // Create path with user ID (UUID) as folder name
      const filePath = `${user.id}/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-pics')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-pics')
        .getPublicUrl(filePath);

      // Update both the file path and the image preview
      setFormData(prev => ({
        ...prev,
        image_url: filePath // Store just the file path, not the full URL
      }));
      setImagePreview(publicUrl);

    } catch (err) {
      console.error('Error uploading product image:', err);
      setErrors(prev => ({
        ...prev,
        image: err.message || 'Failed to upload image'
      }));
    }
  };

  const handleCategorySelect = (category) => {
    if (!formData.categories.find(c => c.id === category.id)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
    setShowCategorySearch(false);
    setCategorySearch('');
  };

  const handleCategoryRemove = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== categoryId)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'name') {
      setErrors(prev => ({
        ...prev,
        name: validateName(value)
      }));
    } else if (name === 'description') {
      setErrors(prev => ({
        ...prev,
        description: validateDescription(value)
      }));
    }
  };

  const colorInRgb = (color) => {
    const isHexColor = /^(#|0x)[0-9A-Fa-f]+$/.test(color);
    return isHexColor ? `rgb(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)})` : color;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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

    try {
      const productData = {
        ...formData,
        item_color_string: colorInRgb(formData.item_color_string),
        category_ids: formData.categories.map(c => c.id)
      };

      if (id) {
        await updateProduct(id, productData, user.id);
      } else {
        await createProduct(productData, user.id);
      }
      navigate('/dashboard');
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        general: err.message || 'Failed to save product. Please try again.'
      }));
      console.error(err);
    }
    setLoading(false);
  };

  // Fetch all categories on dropdown open
  const handleOpenCategoryDropdown = async () => {
    setShowCategorySearch(true);
    if (allCategories.length === 0) {
      try {
        const results = await searchCategories(''); // fetch all
        setAllCategories(results);
        setCategoryResults(results.slice(0, 10));
      } catch (error) {
        setAllCategories([]);
        setCategoryResults([]);
      }
    } else {
      setCategoryResults(allCategories.slice(0, 10));
    }
    setCategorySearch('');
  };

  // Filter as user types
  useEffect(() => {
    if (!showCategorySearch) return;
    if (categorySearch.length === 0) {
      setCategoryResults(allCategories.slice(0, 10));
    } else {
      const filtered = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setCategoryResults(filtered);
    }
  }, [categorySearch, allCategories, showCategorySearch]);

  const handleCreateCategory = async () => {
    try {
      const newCategory = await createCategory(categorySearch);
      handleCategorySelect(newCategory);
    } catch (err) {
      console.error('Error creating category:', err);
      setErrors(prev => ({
        ...prev,
        category: err.message || 'Failed to create category'
      }));
    }
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto rounded-2xl shadow-xl p-0 md:p-0"
      style={{
        marginTop: isHeaderVisible ? '64px' : '0px',
        background: currentTheme.colors.background,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
        border: `1px solid ${currentTheme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Header Section */}
      <div
        className="rounded-t-2xl px-8 py-6 flex flex-col items-center w-full"
        style={{
          background: currentTheme.colors.cardBackground || (currentTheme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
        }}
      >
        <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: currentTheme.colors.primary }}>Add a New pppProduct</h2>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column - Image Upload */}
          <div className="space-y-4 flex flex-col items-center">
            <div
              className="aspect-square w-64 max-w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 dark:bg-gray-800 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900"
              style={{
                borderColor: currentTheme.colors.border
              }}
              // onClick={() => fileInputRef.current?.click()}
            >
              
              <VotedCard
                  item={{
                    image_url: imagePreview,
                    name: formData.name,
                    description: formData.description,
                    item_color_string: formData.item_color_string,
                    votes: [1,2,2,4,5],
                    totalVotes: 20,
                  }}
                />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-white font-semibold shadow"
              style={{
                backgroundColor: currentTheme.colors.primary
              }}
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>
            {errors.image && (
              <p className="text-sm" style={{ color: currentTheme.colors.error }}>
                {errors.image}
              </p>
            )}
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-6">
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
                className={`w-full p-2 rounded border ${errors.name ? 'border-red-500' : ''}`}
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

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: currentTheme.colors.text }}
              >
                Description *
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className={`w-full p-2 rounded border ${errors.description ? 'border-red-500' : ''}`}
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text,
                    border: `1px solid ${errors.description ? currentTheme.colors.error : currentTheme.colors.border}`
                  }}
                />
              </div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Info size={14} />
                Adding a good description helps others understand your product better and makes comparisons more meaningful.
              </div>
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
                Categories
              </label>
              <div className="relative">
                <div
                  className="flex flex-wrap gap-2 p-2 rounded border"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  {formData.categories.map(category => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-1 px-2 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      <span>{category.name}</span>
                      <button
                        type="button"
                        onClick={() => handleCategoryRemove(category.id)}
                        className="hover:bg-opacity-20 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleOpenCategoryDropdown}
                    className="flex items-center space-x-1 px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    <Plus size={14} />
                    <span>Add Category</span>
                  </button>
                </div>

                {showCategorySearch && (
                  <div
                    className="absolute z-20 w-full mt-1 rounded-lg shadow-2xl border"
                    style={{
                      background: currentTheme.colors.cardBackground || '#fff',
                      border: `2px solid ${currentTheme.colors.primary}`,
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                    }}
                  >
                    <div className="p-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Search categories..."
                          className="w-full p-2 pl-8 rounded border"
                          style={{
                            backgroundColor: currentTheme.colors.background,
                            color: currentTheme.colors.text,
                            border: `1px solid ${currentTheme.colors.border}`
                          }}
                          autoFocus
                        />
                        <Search
                          size={16}
                          className="absolute left-2 top-2.5"
                          style={{ color: currentTheme.colors.textSecondary }}
                        />
                      </div>
                      <div className="mt-2 max-h-48 overflow-y-auto">
                        {categoryResults.length === 0 && categorySearch.length > 0 && (
                          <div 
                            onClick={handleCreateCategory}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer rounded flex items-center gap-2 text-blue-600 dark:text-blue-400"
                          >
                            <Plus size={16} />
                            <span>Create "{categorySearch}"</span>
                          </div>
                        )}
                        {categoryResults.map(category => (
                          <div
                            key={category.id}
                            onClick={() => handleCategorySelect(category)}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer rounded"
                            style={{ color: currentTheme.colors.text }}
                          >
                            {category.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: currentTheme.colors.text }}
              >
                Product Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  name="item_color_string"
                  value={formData.item_color_string}
                  onChange={e => setFormData(prev => ({ ...prev, item_color_string: e.target.value }))}
                  className="w-8 h-8 border-none outline-none cursor-pointer bg-transparent"
                  style={{ background: 'none' }}
                  aria-label="Pick product color"
                />
                <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  Pick a color
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg font-medium border bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg font-bold flex items-center space-x-2 text-white shadow text-lg"
            style={{
              backgroundColor: currentTheme.colors.primary
            }}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : id ? (
              <Pencil size={18} />
            ) : (
              <Plus size={18} />
            )}
            <span>{id ? 'Update Product' : 'Add Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductModal; 