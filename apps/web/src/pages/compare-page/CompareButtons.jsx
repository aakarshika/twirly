import { useState } from 'react';
import { Heart, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Share } from '@capacitor/share';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { getCurrentUrl } from '@utils/urlUtils';

const CompareButtons = ({ totalVotes, setData, handleLikeComparisonSet, onInteract }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const hasLiked = setData.hasLiked;
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = getCurrentUrl();
    const sharePayload = { title: 'Check out this comparison!', text: 'Found this on Twirly.', url };
    try {
      await Share.share(sharePayload);
    } catch {
      try {
        if (navigator.share) {
          await navigator.share(sharePayload);
        } else {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const pillStyle = active => ({
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 20,
    padding: '8px 0',
    cursor: 'pointer',
    border: `1px solid ${active ? t.red : `${t.ink}20`}`,
    background: active ? `${t.red}15` : t.bgDeep,
    color: active ? t.red : t.ink,
    fontFamily: '"Fraunces", serif',
    fontSize: 14,
  });

  return (
    <div style={{ padding: '6px 12px 10px', background: t.bg }}>
      <div className="flex justify-between mb-2">
        <span style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}65` }}>
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
        {setData.end_date && (
          <span style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}50` }}>
            ends {formatDistanceToNow(new Date(setData.end_date), { addSuffix: true })}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => { onInteract?.(); handleLikeComparisonSet(setData.id); }} style={pillStyle(hasLiked)}>
          <motion.span animate={{ scale: hasLiked ? [1, 1.35, 1] : 1 }} transition={{ duration: 0.25 }}>
            <Heart size={16} fill={hasLiked ? t.red : 'none'} stroke={hasLiked ? t.red : 'currentColor'} />
          </motion.span>
          <span>{setData.likeCount ?? 0}</span>
        </button>

        <button onClick={() => { onInteract?.(); handleShare(); }} style={{ ...pillStyle(false), position: 'relative' }}>
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span key="check" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Check size={16} style={{ color: t.blue }} />
              </motion.span>
            ) : (
              <motion.span key="share" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Share2 size={16} />
              </motion.span>
            )}
          </AnimatePresence>
          <span>{copied ? 'copied' : 'share'}</span>
        </button>
      </div>
    </div>
  );
};

export default CompareButtons;
