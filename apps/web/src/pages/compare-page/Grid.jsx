import { Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { changeColorAlpha, getPublicUrlItems } from '@utils/utils';
import VotingAnimation from '../comparison-aspect-page/ComparisonItemCard/VotingAnimation/VotingAnimation';

const Grid = ({ gridCollapsed = false, localOptions, setData, handleVote, handleReset }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const navigate = useNavigate();
  const hasVoted = setData.hasVoted;

  return (
    <div
      style={{ height: '100%' }}
      className={gridCollapsed
        ? 'grid grid-cols-4 gap-2 p-3'
        : 'grid grid-cols-2 grid-rows-2 gap-2 p-3'
      }
    >
      {localOptions?.map((opt, i) => {
        const imgSrc = opt.image_url?.startsWith('http')
          ? opt.image_url
          : opt.image_url ? getPublicUrlItems(opt.image_url) : null;
        const accent = opt.item_color_string || 'rgba(100,100,100,1)';
        const isVoted = hasVoted && setData.votedItemId === opt.id;

        return (
          <motion.div
            key={opt.id ?? i}
            className="relative overflow-hidden rounded-xl"
            style={{
              background: imgSrc ? `${t.bgDeep}` : changeColorAlpha(accent, 0.1),
              border: `1.5px solid ${hasVoted && opt.winner ? changeColorAlpha(accent, 0.7) : `${t.ink}18`}`,
            }}
            animate={{
              scale: opt.winner && hasVoted ? [1, 1.02, 1] : 1,
              boxShadow: opt.winner && hasVoted
                ? [
                    `0 0 12px ${changeColorAlpha(accent, 0.35)}`,
                    `0 0 22px ${changeColorAlpha(accent, 0.6)}`,
                    `0 0 12px ${changeColorAlpha(accent, 0.35)}`,
                  ]
                : 'none',
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Item image */}
            {imgSrc && (
              <img
                src={imgSrc}
                alt={opt.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {/* Gradient for bottom text readability */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 45%, transparent 100%)',
            }} />

            {/* Vote fill — rises from bottom (normal layout) or fills from left (collapsed) */}
            {hasVoted && !gridCollapsed && (
              <motion.div
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: changeColorAlpha(accent, 0.45),
                  zIndex: 2,
                }}
                initial={{ height: '0%' }}
                animate={{ height: `${opt.votesPercentage}%` }}
                transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1], delay: 0.25 }}
              />
            )}
            {hasVoted && gridCollapsed && (
              <motion.div
                style={{
                  position: 'absolute', top: 0, right: 0, bottom: 0,
                  background: changeColorAlpha(accent, 0.45),
                  zIndex: 2,
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${opt.votesPercentage}%` }}
                transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1], delay: 0.25 }}
              />
            )}

            {/* Voted checkmark */}
            {isVoted && (
              <motion.button
                className="absolute top-2 left-2 z-20"
                animate={{ scale: [1, 1.18, 1], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }}
                onClick={handleReset}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div style={{
                  background: t.red,
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 1px 4px rgba(0,0,0,0.3)`,
                }}>
                  <span style={{ color: '#fff', fontSize: 13, lineHeight: 1 }}>✓</span>
                </div>
              </motion.button>
            )}

            {/* Expand to item page */}
            <button
              className="absolute top-2 right-2 z-20"
              onClick={() => navigate(`/item/${opt.id}`)}
              style={{
                background: `rgba(0,0,0,0.35)`,
                border: 'none',
                borderRadius: 6,
                padding: 4,
                cursor: 'pointer',
                display: 'flex',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Maximize2 size={gridCollapsed ? 8 : 11} style={{ color: '#fff' }} />
            </button>

            {/* Item name + vote % */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-2 pb-2">
              <span style={{
                fontFamily: '"DM Serif Display", serif',
                fontStyle: 'italic',
                fontSize: gridCollapsed ? 11 : 14,
                color: '#fff',
                display: 'block',
                lineHeight: 1.15,
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                ...(gridCollapsed ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : {}),
              }}>
                {opt.name}
              </span>
              {hasVoted && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.3 }}
                  style={{
                    fontFamily: '"Caveat", cursive',
                    fontSize: gridCollapsed ? 12 : 17,
                    color: '#fff',
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  }}
                >
                  {opt.votesPercentage.toFixed(0)}%
                </motion.span>
              )}
            </div>

            {/* Double-tap voting overlay */}
            {!hasVoted && (
              <div className="absolute inset-0 z-10">
                <VotingAnimation onVote={() => handleVote(opt.id)} />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default Grid;
