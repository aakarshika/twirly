import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../Avatar';
import { getPublicUrl } from '../../../lib/utils';

const ItemCell = ({ item }) => {
  const [imgError, setImgError] = React.useState(false);
  const showImage = item.image_url && !imgError;

  return (
    <div className="relative overflow-hidden bg-surface h-full">
      {showImage ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center p-2"
          style={{ backgroundColor: item.item_color_string || 'rgb(var(--surface-elevated))' }}
        />
      )}
      {/* Name overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2 py-1"
        style={{ backgroundColor: 'rgb(0 0 0 / 0.45)' }}
      >
        <p className="text-white text-xs font-medium truncate">{item.name}</p>
      </div>
    </div>
  );
};

const DEFAULT_ITEM_COUNT = 4;

const TrendingCard = ({ set, itemCount = DEFAULT_ITEM_COUNT }) => {
  const navigate = useNavigate();
  const items = (set.items || []).slice(0, itemCount);
  const n = items.length;

  const handleClick = () => navigate(`/compare/${set.set_id}`);

  // 1 → single tile, 2 → 1×2, 3 → 1×3, 4 → 2×2, 5–6 → 2×3, 7+ → 2×4 etc.
  const cols = n <= 1 ? 1 : n <= 3 ? n : n === 4 ? 2 : Math.ceil(n / 2);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left rounded-lg overflow-hidden bg-surface border border-border hover:border-primary/40 transition-all duration-150 active:scale-[0.98]"
    >
      <div
        className="grid h-32"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {n > 0 ? (
          items.map(item => <ItemCell key={item.id} item={item} />)
        ) : (
          <div
            className="flex items-center justify-center h-32"
            style={{ backgroundColor: 'rgb(var(--surface-elevated))', gridColumn: `1 / -1` }}
          >
            <span className="text-text-muted text-xs">No preview</span>
          </div>
        )}
      </div>

      {/* Set name + category */}
      <div className="px-3 pt-2 pb-1">
        <p className="font-semibold text-sm text-text line-clamp-2 leading-snug">{set.set_name}</p>
        {set.category_name && (
          <span className="text-[11px] font-medium text-primary mt-0.5 inline-block">
            {set.category_name}
          </span>
        )}
      </div>

      {/* Footer: creator + stats + end date */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar
            profileImageUrl={set.creator_image_url ? getPublicUrl(set.creator_image_url) : null}
            displayName={set.creator_display_name}
            username={set.creator_username}
            size="xs"
            onAvatarChange={() => {}}
          />
          <div className="min-w-0">
            <p className="text-[11px] text-text-muted truncate">
              {set.creator_display_name || 'Anonymous'}
            </p>
            {set.end_date && (
              <p className="text-[10px] text-text-muted truncate">
                Ends {formatDistanceToNow(new Date(set.end_date), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {set.total_votes > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-text-muted">
              <Users size={11} />
              {set.total_votes}
            </span>
          )}
          {set.total_comments > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-text-muted">
              <MessageSquare size={11} />
              {set.total_comments}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default TrendingCard;
