import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import Avatar from '@components/common/Avatar';
import { getPublicUrl } from '@utils/utils';

const ItemCell = ({ item }) => {
  const [imgError, setImgError] = React.useState(false);
  const showImage = item.image_url && !imgError;

  return (
    <div className="relative overflow-hidden h-full">
      {showImage ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full"
          style={{ backgroundColor: item.item_color_string || '#E9DFC5' }}
        />
      )}
      <div
        className="absolute bottom-0 left-0 right-0 px-2 py-1"
        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.55))' }}
      >
        <p className="text-white text-xs font-medium truncate" style={{ fontFamily: '"Fraunces", serif' }}>
          {item.name}
        </p>
      </div>
    </div>
  );
};

const DEFAULT_ITEM_COUNT = 4;

const TrendingCard = ({ set, itemCount = DEFAULT_ITEM_COUNT }) => {
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  const items = (set.items || []).slice(0, itemCount);
  const n = items.length;
  const cols = n <= 1 ? 1 : n <= 3 ? n : n === 4 ? 2 : Math.ceil(n / 2);

  return (
    <motion.button
      type="button"
      onClick={() => navigate(`/compare/${set.set_id}`)}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="w-full text-left overflow-hidden"
      style={{
        background: t.bg,
        border: `1px solid ${t.ink}18`,
        borderRadius: 4,
      }}
    >
      {/* Image grid */}
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, height: 120 }}
      >
        {n > 0 ? (
          items.map(item => <ItemCell key={item.id} item={item} />)
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ gridColumn: '1 / -1', height: 120, background: t.bgDeep }}
          >
            <span style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: t.ink, opacity: 0.4 }}>
              no preview
            </span>
          </div>
        )}
      </div>

      {/* Text area */}
      <div className="px-3 pt-2 pb-2.5" style={{ background: t.bg }}>
        {set.category_name && (
          <span
            style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: t.blue, letterSpacing: '0.04em', opacity: 0.85 }}
          >
            {set.category_name}
          </span>
        )}
        <p
          className="line-clamp-2 leading-snug"
          style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, marginTop: set.category_name ? 2 : 0 }}
        >
          {set.set_name}
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar
              profileImageUrl={set.creator_image_url ? getPublicUrl(set.creator_image_url) : null}
              displayName={set.creator_display_name}
              username={set.creator_username}
              size="xs"
            />
            <div className="min-w-0">
              <p
                className="truncate"
                style={{ fontFamily: '"Fraunces", serif', fontSize: 11, color: t.ink, opacity: 0.55 }}
              >
                {set.creator_display_name || 'Anonymous'}
              </p>
              {set.end_date && (
                <p
                  className="truncate"
                  style={{ fontFamily: '"Caveat", cursive', fontSize: 11, color: t.ink, opacity: 0.4 }}
                >
                  ends {formatDistanceToNow(new Date(set.end_date), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 ml-2">
            {set.total_votes > 0 && (
              <span
                className="flex items-center gap-0.5"
                style={{ fontFamily: '"Fraunces", serif', fontSize: 11, color: t.ink, opacity: 0.45 }}
              >
                <Users size={11} />
                {set.total_votes}
              </span>
            )}
            {set.total_comments > 0 && (
              <span
                className="flex items-center gap-0.5"
                style={{ fontFamily: '"Fraunces", serif', fontSize: 11, color: t.ink, opacity: 0.45 }}
              >
                <MessageSquare size={11} />
                {set.total_comments}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default TrendingCard;
