import React, { useState } from 'react';
import { Heart, Info, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useVotedCard } from '@hooks/useVotedCard';
import { changeColorAlpha, darkenColor } from '@utils/utils';
import VoteStats from './VoteStats/VoteStats';
import Modal from '../../../components/common/Modal';

const WinnerBadge = ({ type, onToggle, expanded }) => (
  <motion.div
    animate={{ scale: [1, 1.06, 1], y: [0, -3, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    className="cursor-pointer p-1 flex flex-col items-center"
    onClick={onToggle}
  >
    {type === 'winner' ? (
      <Trophy size={20} color="rgb(237,193,21)" fill="rgb(244,213,90)" />
    ) : (
      <Star size={17} color="rgb(70,137,243)" fill="rgb(137,179,246)" />
    )}
    {expanded && (
      <span style={{ fontFamily: '"Caveat", cursive', fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>
        {type === 'winner' ? 'winner' : 'runner-up'}
      </span>
    )}
  </motion.div>
);

const VotedCard = ({
  item,
  handleRevertClick,
  totalVotes = 0,
  isVotedItem,
  userVotedAll,
  winner,
  runnerUp,
}) => {
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedBadge, setExpandedBadge] = useState(null);

  const { titleRef, itemImage, color } = useVotedCard({
    item,
    handleRevertClick,
    totalVotes,
    isVotedItem,
  });

  const isWinner = winner?.id === item.id;
  const isRunnerUp = runnerUp?.id === item.id;
  const badgeType = isWinner ? 'winner' : isRunnerUp ? 'runner-up' : null;

  const toggleBadge = () => setExpandedBadge(prev => (prev ? null : badgeType));

  return (
    <div
      className="relative w-full overflow-hidden rounded-sm"
      style={{
        aspectRatio: '1/1',
        border: isVotedItem ? `2px solid ${t.red}` : `1px solid ${t.ink}18`,
        background: itemImage ? 'transparent' : changeColorAlpha(color, 0.15),
      }}
    >
      {/* Image */}
      {itemImage && (
        <img
          src={itemImage}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Voted glow pulse */}
      {isVotedItem && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.05, 0.14, 0.05] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ background: t.red }}
        />
      )}

      {/* No-image: centered name + stats */}
      {!itemImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 gap-2">
          <div className="flex items-center gap-1.5">
            <p
              ref={titleRef}
              className="text-center"
              style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 16, color: darkenColor(color, 70), lineHeight: 1.2 }}
            >
              {item.name}
            </p>
            {badgeType && (
              <WinnerBadge type={badgeType} onToggle={toggleBadge} expanded={expandedBadge === badgeType} />
            )}
          </div>
          <VoteStats
            votes={item.voteCount}
            totalVotes={totalVotes}
            color={color}
            isVotedItem={isVotedItem}
            leadingMetrics={item.leadingMetrics}
            userVotedAll={userVotedAll}
          />
        </div>
      )}

      {/* Image overlay: name + stats + badge */}
      {itemImage && (
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2"
          style={{ background: `linear-gradient(to top, ${changeColorAlpha(color, 0.88)} 0%, transparent 100%)` }}
        >
          <div className="flex items-end justify-between gap-1">
            <p
              ref={titleRef}
              style={{ fontFamily: '"Fraunces", serif', fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}
            >
              {item.name}
            </p>
            {badgeType && (
              <WinnerBadge type={badgeType} onToggle={toggleBadge} expanded={expandedBadge === badgeType} />
            )}
          </div>
          <VoteStats
            votes={item.voteCount}
            totalVotes={totalVotes}
            color={color}
            isVotedItem={isVotedItem}
            leadingMetrics={item.leadingMetrics}
            userVotedAll={userVotedAll}
          />
        </div>
      )}

      {/* Revert vote */}
      {isVotedItem && (
        <button
          type="button"
          onClick={handleRevertClick}
          className="absolute top-2 right-2 rounded-full flex items-center justify-center"
          style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.88)', minHeight: 32 }}
        >
          <Heart size={14} fill={t.red} stroke={t.red} />
        </button>
      )}

      {/* Info → modal */}
      <button
        type="button"
        className="absolute bottom-2 right-2 rounded-full flex items-center justify-center"
        onClick={e => { e.stopPropagation(); setIsModalOpen(true); }}
        style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.8)' }}
      >
        <Info size={13} style={{ color: darkenColor(color, 50) }} />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={item.name}
        size="md"
      >
        <div className="flex flex-col gap-4 items-center">
          {itemImage && (
            <img src={itemImage} alt={item.name} className="w-24 h-24 rounded-sm object-cover" />
          )}
          <button
            type="button"
            onClick={() => navigate(`/item/${item.id}`)}
            style={{ padding: '10px 24px', background: t.red, color: '#fff', fontFamily: '"Fraunces", serif', fontSize: 14, borderRadius: 2, minHeight: 44 }}
          >
            go to item page
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default VotedCard;
