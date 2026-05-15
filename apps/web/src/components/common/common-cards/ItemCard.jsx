import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { changeColorAlpha, darkenColor, getPublicUrlItems } from '@utils/utils';

const ItemCard = ({ item }) => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  const itemImage = item.image_url?.startsWith('http')
    ? item.image_url
    : getPublicUrlItems(item.image_url);

  return (
    <motion.div whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
      <Link
        to={`/item/${item.id}`}
        className="flex items-start gap-3 p-3 block"
        style={{
          backgroundColor: changeColorAlpha(item.item_color_string, 0.12),
          border: `1px solid ${t.ink}18`,
          borderRadius: 4,
          textDecoration: 'none',
        }}
      >
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
          {itemImage ? (
            <img src={itemImage} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                backgroundColor: changeColorAlpha(item.item_color_string, 0.35),
                color: darkenColor(item.item_color_string, 40),
                fontFamily: '"DM Serif Display", serif',
                fontStyle: 'italic',
                fontSize: 18,
              }}
            >
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="truncate"
            style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.ink, lineHeight: 1.3 }}
          >
            {item.name}
          </h3>

          {item.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.categories.slice(0, 2).map(category => (
                <span
                  key={category.id}
                  className="px-2 py-0.5 rounded-sm"
                  style={{
                    backgroundColor: changeColorAlpha(item.item_color_string, 0.18),
                    color: darkenColor(item.item_color_string, 50),
                    fontFamily: '"Caveat", cursive',
                    fontSize: 12,
                  }}
                >
                  {category.name}
                </span>
              ))}
              {item.categories.length > 2 && (
                <span
                  className="px-2 py-0.5 rounded-sm"
                  style={{
                    backgroundColor: changeColorAlpha(item.item_color_string, 0.18),
                    color: darkenColor(item.item_color_string, 50),
                    fontFamily: '"Caveat", cursive',
                    fontSize: 12,
                  }}
                >
                  +{item.categories.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ItemCard;
