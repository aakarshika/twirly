import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { changeColorAlpha, darkenColor, getPublicUrlItems } from '../../../lib/utils';

const ItemCard = ({item}) => {
  const { currentTheme } = useTheme();
  const itemImage = item.image_url && item.image_url.startsWith('http') ? item.image_url : getPublicUrlItems(item.image_url);
  
  return (
    <Link
      to={`/item/${item.id}`}
      className="block p-4 rounded-lg transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: changeColorAlpha(item.item_color_string, 0.2),
        borderColor: currentTheme.colors.border,
        border: '1px solid ' + item.item_color_string
      }}
    >
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
          {itemImage ? (
            <img
              src={itemImage}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-2xl font-bold bg-opacity-10"
              style={{ 
                backgroundColor: changeColorAlpha(item.item_color_string, 0.4),
                color: item.item_color_string
              }}
            >
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 
            className="font-medium text-lg truncate" 
            style={{ color: currentTheme.colors.text }}
          >
            {item.name}
          </h3>
          {item.categories?.length > 0 && (
            <div className="flex flex-wrap mt-3 gap-2">
              {item.categories.slice(0, 2).map((category) => (
                <div 
                  key={category.id} 
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-opacity-20"
                  style={{
                    backgroundColor: changeColorAlpha(item.item_color_string, 0.2),
                    color: darkenColor(item.item_color_string, 50)
                  }}
                >
                  {category.name}
                </div>
              ))}
              {item.categories.length > 2 && (
                <div 
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-opacity-20"
                  style={{
                    backgroundColor: changeColorAlpha(item.item_color_string, 0.2),
                    color: darkenColor(item.item_color_string, 50)
                  }}
                >
                  +{item.categories.length - 2}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ItemCard; 