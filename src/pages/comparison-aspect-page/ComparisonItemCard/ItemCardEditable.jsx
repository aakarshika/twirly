import React, { useRef, useState, useEffect } from 'react';
import { Check, Circle, Pencil, ThumbsUp, Upload, X } from 'lucide-react';
import VoteStats from './VoteStats/VoteStats';
import './ComparisonItemCard.css';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { createProduct, updateProduct } from '../../../services/products';
import { randomPastelColorHex } from '../../../lib/utils';

const ItemCardEditable = ({
  item,
  newHeight = '35vh',
  onSave,
  onCancel
}) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);
  const colorButtonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemData, setItemData] = useState({
    name: item?.name || '',
    image_url: item?.image_url || '',
    item_color_string: item?.item_color_string || randomPastelColorHex()
  });

  // Convert RGB to hex
  const rgbToHex = (rgb) => {
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
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
      setItemData(prev => ({
        ...prev,
        image_url: filePath // Store just the file path, not the full URL
      }));

    } catch (err) {
      console.error('Error uploading product image:', err);
      setError(err.message || 'Failed to upload image');
    }
  };

  const handleRemoveImage = async () => {
    try {
      if (itemData.image_url) {
        // Delete the file from storage
        const { error: deleteError } = await supabase.storage
          .from('product-pics')
          .remove([itemData.image_url]);

        if (deleteError) throw deleteError;

        // Update state
        setItemData(prev => ({
          ...prev,
          image_url: ''
        }));
      }
    } catch (err) {
      console.error('Error removing image:', err);
      setError(err.message || 'Failed to remove image');
    }
  };

  const handleColorChange = (e) => {
    setItemData(prev => ({
      ...prev,
      item_color_string: e.target.value
    }));
  };

  const handleColorClick = () => {
    if (colorInputRef.current && colorButtonRef.current) {
      // Position the color input near the button
      const buttonRect = colorButtonRef.current.getBoundingClientRect();
      colorInputRef.current.style.position = 'absolute';
      colorInputRef.current.style.left = `${buttonRect.left}px`;
      colorInputRef.current.style.top = `${buttonRect.bottom + 5}px`;
      colorInputRef.current.style.zIndex = '1000';
      colorInputRef.current.click();
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const productData = {
        ...itemData,
        item_color_string: color
      };

      if (item.id) {
        await updateProduct(item.id, productData, user.id);

        if (onSave) {
            onSave({
            ...productData,
            id: item.id
            });
        }
      } else {
        const itemNew = await createProduct(productData, user.id);
        console.log("created product", itemNew);
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

    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" >
    <div className="bg-white rounded-lg p-4">
    <div className="flex flex-col gap-4" >
      <div
        className="comparison-item-card rounded-lg"
        style={{ 
          height: newHeight,
          border: '4px solid ' + color,
          backgroundColor: color?.substring(0, color.length - 1) + ', 0.2)'
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
                src={supabase.storage.from('product-pics').getPublicUrl(itemData.image_url).data.publicUrl}
                alt={itemData.name}
                className="item-image"
                loading="lazy"
              />
            ) : (
              <div
                className="text-fallback"
                style={{
                  background: color?.substring(0, color.length - 1) + ', 0.2)',
                  color: '#000'
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
                <div className="flex items-center justify-start">
                  <div 
                    className="px-4 py-2 rounded-full text-white font-semibold shadow"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      backgroundColor: currentTheme.colors.primary
                    }}
                  >
                    <Upload size={16} />
                  </div>

                  <div 
                    ref={colorButtonRef}
                    className="px-4 py-2 rounded-full text-white font-semibold shadow cursor-pointer"
                    onClick={handleColorClick}
                    style={{
                      backgroundColor: 'white'
                    }}
                  >
                    <Circle size={16} fill={color} />
                  </div>
                </div>
                <div className="text-fallback-content">
                    {/* multiline input */}
                    {/* multi line placeholder */}
                  <textarea 
                    type="text" 
                    className="w-full h-full text-fallback-title" 
                    multiline
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
                    onChange={(e) => setItemData(prev => ({ ...prev, name: e.target.value }))} 
                  />
                </div>
                <div 
                  className="flex items-center gap-2 content-overlay"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: color,
                  }}
                >
                  <VoteStats
                    votes={10}
                    totalVotes={50}
                    color={color}
                    isVotedItem={false}
                    reviewCount={10}
                    itemReviewData={[]}
                  />
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
                onChange={(e) => setItemData(prev => ({ ...prev, name: e.target.value }))} 
              />
              <div 
                className="flex items-center gap-2" 
                style={{ cursor: 'pointer' }} 
              >
                <VoteStats
                  votes={10}
                  totalVotes={50}
                  color={color}
                  isVotedItem={false}
                  reviewCount={10}
                  itemReviewData={[]}
                />
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
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
          <X size={16} fill={'white'} />
          <span>Cancel</span>
        </div>
        <div 
          className="px-4 py-2 rounded-lg text-white font-semibold shadow flex items-center gap-2"
          onClick={handleSave}
          style={{
            backgroundColor: currentTheme.colors.primary,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
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