import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Settings, MessageSquare, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { getPublicUrlItems } from '@utils/utils';

const EASE = [0.16, 1, 0.3, 1];

const ItemThumb = ({ item, t }) => {
  const [imgErr, setImgErr] = useState(false);
  const src = item.image_url?.startsWith('http')
    ? item.image_url
    : getPublicUrlItems(item.image_url);

  return (
    <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: 4 }}>
      {src && !imgErr ? (
        <img
          src={src}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgErr(true)}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          background: item.item_color_string || t.bgDeep,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: '"DM Serif Display", serif',
            fontStyle: 'italic',
            fontSize: 14,
            color: t.ink,
            opacity: 0.5,
          }}>
            {item.name?.charAt(0) ?? '?'}
          </span>
        </div>
      )}
    </div>
  );
};

const ComparisonCard = ({ comparison, onDelete, isPublic }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const { user } = useAuth();
  const navigate = useNavigate();

  const items = comparison?.items ?? [];
  const totalVotes = comparison?.votes?.length ?? 0;
  const totalComments = comparison?.comparison_set_comments?.length ?? 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: EASE }}
      onClick={() => navigate(`/compare/${comparison.id}`)}
      style={{
        background: t.bgDeep,
        border: `1px solid ${t.ink}18`,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header row */}
      <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${t.ink}10` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{
            fontFamily: '"DM Serif Display", serif',
            fontStyle: 'italic',
            fontSize: 18,
            color: t.ink,
            lineHeight: 1.2,
            flex: 1,
            margin: 0,
          }}>
            {comparison?.name || 'Untitled comparison'}
          </h3>
          <span style={{
            fontFamily: '"Caveat", cursive',
            fontSize: 12,
            color: comparison?.is_published ? t.blue : t.mustard,
            border: `1px solid ${comparison?.is_published ? t.blue : t.mustard}60`,
            borderRadius: 4,
            padding: '1px 7px',
            flexShrink: 0,
            lineHeight: 1.6,
          }}>
            {comparison?.is_published ? 'live' : 'draft'}
          </span>
        </div>
      </div>

      {/* 2×2 item thumbnail grid */}
      {items.length > 0 && (
        <div style={{
          padding: '10px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 6,
        }}>
          {items.slice(0, 4).map(setItem => (
            <ItemThumb key={setItem.id} item={setItem.item} t={t} />
          ))}
        </div>
      )}

      {/* Footer: vote / comment counts + actions */}
      <div style={{
        padding: '8px 16px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: '"Caveat", cursive', fontSize: 14,
            color: t.ink, opacity: 0.55,
          }}>
            <ThumbsUp size={13} /> {totalVotes}
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: '"Caveat", cursive', fontSize: 14,
            color: t.ink, opacity: 0.55,
          }}>
            <MessageSquare size={13} /> {totalComments}
          </span>
        </div>

        {!isPublic && user && (
          <div
            style={{ display: 'flex', gap: 2 }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => navigate(`/edit-comparison/${comparison.id}`)}
              style={{
                padding: 5, border: 'none', background: 'transparent',
                cursor: 'pointer', color: t.ink, opacity: 0.45,
              }}
              title="Edit"
            >
              <Settings size={15} />
            </button>
            <button
              onClick={() => onDelete(comparison.id)}
              style={{
                padding: 5, border: 'none', background: 'transparent',
                cursor: 'pointer', color: t.red,
              }}
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ComparisonCard;
