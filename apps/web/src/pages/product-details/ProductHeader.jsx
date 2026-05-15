import { useState } from 'react';
import { motion } from 'framer-motion';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { getPublicUrlItems } from '@utils/utils';

const EASE = [0.16, 1, 0.3, 1];

const ProductHeader = ({ item }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const [imgErr, setImgErr] = useState(false);

  if (!item) return null;

  const src = item.image_url?.startsWith('http')
    ? item.image_url
    : item.image_url
      ? getPublicUrlItems(item.image_url)
      : null;

  return (
    <div className="flex items-start gap-5 pb-6" style={{ borderBottom: `1px solid ${t.ink}12` }}>
      {/* Image or colour swatch */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          width: 88,
          height: 88,
          borderRadius: 8,
          overflow: 'hidden',
          flexShrink: 0,
          border: `1px solid ${t.ink}15`,
          background: item.item_color_string || t.bgDeep,
        }}
      >
        {src && !imgErr ? (
          <img
            src={src}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              fontSize: 28,
              color: t.ink,
              opacity: 0.4,
            }}>
              {item.name?.charAt(0) ?? '?'}
            </span>
          </div>
        )}
      </motion.div>

      {/* Name + description */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
      >
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontStyle: 'italic',
          fontSize: 'clamp(24px, 5vw, 36px)',
          lineHeight: 1.1,
          color: t.ink,
          margin: 0,
          marginBottom: item.description ? 6 : 0,
        }}>
          {item.name}
        </h1>
        {item.description && (
          <p style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 14,
            color: t.ink,
            opacity: 0.65,
            lineHeight: 1.5,
            margin: 0,
            maxWidth: 480,
          }}>
            {item.description}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ProductHeader;
