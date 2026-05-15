import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const EASE = [0.16, 1, 0.3, 1];

const ReviewCard = ({ review, index }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  const timeAgo = review.created_at
    ? formatDistanceToNow(new Date(review.created_at), { addSuffix: true })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index ?? 0) * 0.05, ease: EASE }}
      style={{
        background: t.bgDeep,
        border: `1px solid ${t.ink}15`,
        borderRadius: 8,
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h3 style={{
            fontFamily: '"DM Serif Display", serif',
            fontStyle: 'italic',
            fontSize: 17,
            color: t.ink,
            margin: 0,
            lineHeight: 1.2,
          }}>
            {review.productName}
          </h3>
          {review.category && (
            <span style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 13,
              color: t.ink,
              opacity: 0.5,
            }}>
              {review.category}
            </span>
          )}
        </div>
        {review.likes > 0 && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: '"Caveat", cursive', fontSize: 13,
            color: t.red, opacity: 0.8, flexShrink: 0,
          }}>
            <Heart size={13} fill={t.red} /> {review.likes}
          </span>
        )}
      </div>

      <p style={{
        fontFamily: '"Fraunces", serif',
        fontSize: 14,
        color: t.ink,
        lineHeight: 1.55,
        margin: 0,
        marginBottom: timeAgo ? 8 : 0,
      }}>
        {review.text}
      </p>

      {timeAgo && (
        <span style={{
          fontFamily: '"Caveat", cursive',
          fontSize: 13,
          color: t.ink,
          opacity: 0.45,
        }}>
          {timeAgo}
        </span>
      )}
    </motion.div>
  );
};

export default ReviewCard;
