import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { getPublicUrl, getPublicUrlItems } from '../../../lib/utils';

const ItemCard = ({item}) => {
  const { currentTheme } = useTheme();
  const itemImage = item.image_url && item.image_url.startsWith('http') ? item.image_url : getPublicUrlItems(item.image_url);
  // if image is our onwaiting, get public url.
  
    return (
      <Link
        to={`/item/${item.id}`}
        className="block p-2 rounded-lg hover:bg-gray-50"
        style={{
          backgroundColor: currentTheme.colors.card,
          borderColor: currentTheme.colors.border,
          border: '1px solid'
        }}
      >
        <div className="flex items-start">
          <div className="w-14 h-14 rounded-lg overflow-hidden mr-2 flex-shrink-0">
            {itemImage ? (
              <img
                src={itemImage}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: item.item_color_string }}
              >
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium" style={{ color: currentTheme.colors.text }}>
              {item.name}
            </h3>
            {item.description && (
              <div>
                <p className="text-sm mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                  {item.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
};

export default ItemCard; 