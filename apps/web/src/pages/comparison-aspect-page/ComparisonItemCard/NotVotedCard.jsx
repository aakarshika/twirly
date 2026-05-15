import React from 'react';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useVotedCard } from '@hooks/useVotedCard';

const NotVotedCard = ({ item }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const { titleRef, itemImage } = useVotedCard({ item });

  return (
    <div
      className="relative w-full overflow-hidden rounded-sm"
      style={{ aspectRatio: '1/1', background: t.bgDeep }}
    >
      {itemImage ? (
        <>
          <img
            src={itemImage}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }}
          >
            <p
              ref={titleRef}
              className="text-sm leading-tight"
              style={{ fontFamily: '"Fraunces", serif', color: '#fff', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {item.name}
            </p>
          </div>
        </>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center p-4"
          style={{ background: t.bgDeep }}
        >
          <p
            ref={titleRef}
            className="text-center"
            style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 18, color: t.ink, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {item.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotVotedCard;
