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
          backgroundColor: item.item_color_string,
          borderColor: currentTheme.colors.border,
          border: '1px solid ' + item.item_color_string
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
            <div className="flex flex-wrap mt-4 gap-1">
            {item.categories?.length > 0 && item.categories.slice(0, 2).map((category) => (
              <div key={category.id} className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {category.name}
              </div>
            ))} {item.categories?.length > 2 && <div className="flex"><span className=" bg-green-100 text-xs text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full px-2 py-1">+{item.categories.length - 2}</span></div>}
            </div>
          </div>
        </div>
      </Link>
    );
};

export default ItemCard; 