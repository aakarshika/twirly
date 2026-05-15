import React, { useRef, useState, useEffect } from 'react';
import { Check, Circle, Pencil, Upload, X, Plus, Search } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import './ComparisonItemCard.css';
import { themes } from '@styles/themes';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../lib/apiClient';
import { createProduct, updateProduct, searchCategories, createCategory } from '../../../services/products';
import { randomPastelColorHex } from '../../../lib/utils';

const ItemCardEditable = ({
  item,
  newHeight = '35vh',
  onSave,
  onCancel,
}) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);
  const colorButtonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemData, setItemData] = useState({
    name: item?.name || '',
    image_url: item?.image_url || '',
    item_color_string: item?.item_color_string || randomPastelColorHex(),
    categories: item?.categories || [],
  });
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryResults, setCategoryResults] = useState([]);
  const [showCategorySearch, setShowCategorySearch] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Convert RGB to hex
  const rgbToHex = rgb => {
    // If it's already a hex color, return it
    if (rgb.startsWith('#')) return rgb;

    // Extract RGB values
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues || rgbValues.length < 3) return '#ffffff';

    // Convert to hex
    const r = parseInt(rgbValues[0]).toString(16).padStart(2, '0');
    const g = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
    const b = parseInt(rgbValues[2]).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
  };

  //detect and convert hex to rgb:
  const isHexColor = /^(#|0x)[0-9A-Fa-f]+$/.test(itemData.item_color_string);
  //convert hex to rgb(r,g,b) where r,g,b are numbers between 0 and 255
  const color = isHexColor ? `rgb(${parseInt(itemData.item_color_string.slice(1, 3), 16)}, ${parseInt(itemData.item_color_string.slice(3, 5), 16)}, ${parseInt(itemData.item_color_string.slice(5, 7), 16)})` : itemData.item_color_string;

  // Update color input value when item color changes
  useEffect(() => {
    if (colorInputRef.current) {
      colorInputRef.current.value = rgbToHex(itemData.item_color_string);
    }
  }, [itemData.item_color_string]);

  // Add useEffect for category search
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

  // Add category handlers
  const handleCategorySelect = category => {
    if (!itemData.categories?.find(c => c.id === category.id)) {
      setItemData(prev => ({
        ...prev,
        categories: [...(prev.categories || []), category],
      }));
    }
    setShowCategorySearch(false);
    setCategorySearch('');
  };

  const handleCategoryRemove = categoryId => {
    setItemData(prev => ({
      ...prev,
      categories: prev.categories?.filter(c => c.id !== categoryId) || [],
    }));
  };

  // Add category dropdown handler
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

  // Add category filter effect
  useEffect(() => {
    if (!showCategorySearch) return;
    if (categorySearch.length === 0) {
      setCategoryResults(allCategories.slice(0, 10));
    } else {
      const filtered = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
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
      setError(err.message || 'Failed to create category');
    }
  };

  const handleImageChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const form = new FormData();
      form.append('file', file);
      const { data } = await apiClient.post('/api/uploads?bucket=product-pics', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setItemData(prev => ({ ...prev, image_url: data.data.url }));
    } catch (err) {
      console.error('Error uploading product image:', err);
      setError(err.message || 'Failed to upload image');
    }
  };

  const handleRemoveImage = () => {
    setItemData(prev => ({ ...prev, image_url: '' }));
  };

  const handleColorChange = e => {
    setItemData(prev => ({
      ...prev,
      item_color_string: e.target.value,
    }));
  };

  const handleColorClick = () => {
    setShowColorPicker(!showColorPicker);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const productData = {
        ...itemData,
        item_color_string: color,
        category_ids: itemData.categories?.map(c => c.id) || [],
      };

      if (item.id) {
        await updateProduct(item.id, productData, user.id);

        if (onSave) {
            onSave({
            ...productData,
            id: item.id,
            });
        }
      } else {
        const itemNew = await createProduct(productData, user.id);
        // console.log("created product", itemNew);
        if (onSave) {
            onSave(itemNew);
        }
      }

    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product');
    }
    setLoading(false);
  };

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4" >
    <div className="bg-white rounded-lg p-4">
    <div className="flex flex-col gap-4" >
      <div
        className="comparison-item-card rounded-lg"
        style={{
          height: newHeight,
          border: '4px solid ' + color,
          backgroundColor: color?.substring(0, color.length - 1) + ', 0.2)',
        }}
      >
        <div className="card-container">
          <div className="relative flex flex-col w-full h-full">
            {itemData.image_url && (
              <div className="flex flex-row justify-end items-center gap-2 absolute top-0 right-0 z-10">
                <button
                  className="you-voted-badge"
                  onClick={handleRemoveImage}
                  type="button"
                >
                  <X size={24} fill={'lightgray'} />
                </button>

                <button
                  className="you-voted-badge"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Pencil size={24} />
                </button>
              </div>
            )}

            {itemData.image_url ? (
              <img
                src={itemData.image_url}
                alt={itemData.name}
                className="item-image"
                loading="lazy"
              />
            ) : (
              <div
                className="text-fallback"
                style={{
                  background: color?.substring(0, color.length - 1) + ', 0.2)',
                  color: '#000',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="color"
                  ref={colorInputRef}
                  value={rgbToHex(itemData.item_color_string)}
                  onChange={handleColorChange}
                  className="hidden"
                />
                <div className="text-fallback-content p-2 items-center">
                    {/* multiline input */}
                    {/* multi line placeholder */}

                  <div
                    className="flex flex-col items-center justify-center px-4 py-2 rounded-sm text-white mb-4"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: '1px dashed ' + color,
                    }}
                  >
                    <Upload size={16} />
                    <span>Upload Image</span>
                  </div>
                  <textarea
                    type="text"
                    className="w-full h-full text-fallback-title items-center text-center"
                    rows={3}
                    style={{
                      color: 'black',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      padding: '0',
                      margin: '0',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                    }}
                    autoFocus
                    value={itemData.name}
                    placeholder="What do you wish to compare?"
                    onChange={e => setItemData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div
                  className="flex items-center gap-2 content-overlay"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: color,
                  }}
                >
                </div>
              </div>
            )}
          </div>

          {itemData.image_url && (
            <div
              className="absolute bottom-0 left-0 right-0 p-4 content-overlay"
              style={{ backgroundColor: color }}
            >
              <input
                type="text"
                className="w-full text-fallback-title"
                style={{
                  color: 'black',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '0',
                  margin: '0',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                }}
                value={itemData.name}
                onChange={e => setItemData(prev => ({ ...prev, name: e.target.value }))}
              />
              <div
                className="flex items-center gap-2"
                style={{ cursor: 'pointer' }}
              >
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-start">
        <div className="relative">
          <div
            ref={colorButtonRef}
            className="px-2 py-1 rounded-full shadow cursor-pointer flex items-center gap-2"
            onClick={handleColorClick}
            style={{
              backgroundColor: 'white',
              border: '1px solid ' + color,
              color: color,
            }}
          >
            <Circle size={16} fill={color} />
            Change
          </div>
          {showColorPicker && (
            <div
              className="absolute left-0 top-full mt-2 z-50"
              style={{
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <HexColorPicker
                color={rgbToHex(itemData.item_color_string)}
                onChange={newColor => {
                  setItemData(prev => ({
                    ...prev,
                    item_color_string: newColor,
                  }));
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <div className="relative">
          <div
            className="flex flex-wrap gap-2 p-2 rounded border"
            style={{
              backgroundColor: t.bgDeep,
              border: `1px solid ${t.ink}25`,
            }}
          >

<button
              type="button"
              onClick={handleOpenCategoryDropdown}
              className="flex items-center space-x-1 px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              <Plus size={14} />
              <span>Add Tag</span>
            </button>
            {itemData.categories?.map(category => (
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
          </div>

          {showCategorySearch && (
            <div
              className="absolute z-20 w-full mt-1 rounded-lg shadow-2xl border"
              style={{
                background: t.bgDeep,
                border: `2px solid ${t.red}`,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
              }}
            >
              <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full p-2 pl-8 rounded border"
                    style={{
                      backgroundColor: t.bg,
                      color: t.ink,
                      border: `1px solid ${t.ink}25`,
                    }}
                    autoFocus
                  />
                  <Search
                    size={16}
                    className="absolute left-2 top-2.5"
                    style={{ color: `${t.ink}55` }}
                  />
                </div>
                <div className="mt-2 max-h-48 overflow-y-auto">
                  {!categoryResults.some(c => c.name.toLowerCase().trim() === categorySearch.toLowerCase().trim()) && categorySearch.length > 0 && (
                    <div
                      onClick={handleCreateCategory}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer rounded flex items-center gap-2 text-blue-600 dark:text-blue-400"
                    >
                      <Plus size={16} />
                      <span>Create &quot;{categorySearch}&quot;</span>
                    </div>
                  )}
                  {categoryResults.map(category => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer rounded"
                      style={{ color: t.ink }}
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

      <div className="flex items-center justify-end gap-2">
        <div className="px-4 py-2 rounded-lg text-white font-semibold shadow flex items-center gap-2"
          onClick={onCancel}
          style={{
            backgroundColor: 'gray',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
          <X size={16} fill={'white'} />
          <span>Cancel</span>
        </div>
        <div
          className="px-4 py-2 rounded-lg text-white font-semibold shadow flex items-center gap-2"
          onClick={handleSave}
          style={{
            backgroundColor: t.red,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Check size={16} fill={'white'} />
              <span>Save</span>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-500 mt-2">
          {error}
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default ItemCardEditable;
