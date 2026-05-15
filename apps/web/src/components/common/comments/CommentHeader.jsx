import React from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import Avatar from '@components/common/Avatar';
import { getPublicUrl } from '@utils/utils';
import { renderTextWithMentions } from '@utils/commentUtils';
import './Reply.css';

const CommentHeader = ({
  onLike,
  isReplySectionExpanded,
  replyClicked,
  items,
  type,
  profile_image_url,
  display_name,
  user_id: _user_id,
  created_at,
  text,
  userReaction,
  reactions,
  comment: _comment,
  objectId,
  numReplies,
}) => {
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  const itemColorCoding = (items || []).map(item => ({
    id: item.items ? item.items.id : item.id,
    item_color_string: item.items ? item.items.item_color_string : item.item_color_string,
  }));

  const displayNameClipped = display_name ? display_name.slice(0, 25) : 'Anonymous';

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-start gap-2">
        <Avatar
          profileImageUrl={profile_image_url ? getPublicUrl(profile_image_url) : null}
          displayName={displayNameClipped}
          size="xs"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate(`/user/${display_name}`)}
              style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.ink, fontWeight: 600 }}
              className="hover:opacity-70 transition-opacity"
            >
              {displayNameClipped}
            </button>
            <span
              style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: t.ink, opacity: 0.4 }}
            >
              {formatDistanceToNow(new Date(created_at ?? new Date()), { addSuffix: true })}
            </span>
          </div>

          {text && (
            <p
              className="mt-1 text-sm leading-snug"
              style={{ fontFamily: '"Fraunces", serif', color: t.ink, opacity: 0.85 }}
            >
              <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(text, itemColorCoding) }} />
            </p>
          )}

          {(type === 'Reply' || type === 'LastReply') && (
            <div className="flex items-center gap-4 mt-2 mb-3">
              <button
                type="button"
                onClick={() => onLike(objectId, type)}
                className="flex items-center gap-1"
                style={{
                  fontFamily: '"Fraunces", serif',
                  fontSize: 12,
                  color: userReaction === 'like' ? t.red : `${t.ink}60`,
                }}
              >
                <Heart
                  size={13}
                  fill={userReaction === 'like' ? t.red : 'none'}
                  stroke={userReaction === 'like' ? t.red : 'currentColor'}
                />
                {reactions ? reactions.length : 0}
              </button>

              {type === 'Reply' && (
                <button
                  type="button"
                  onClick={replyClicked}
                  className="flex items-center gap-1"
                  style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: `${t.ink}60` }}
                >
                  <MessageSquare size={13} />
                  {isReplySectionExpanded
                    ? 'Hide replies'
                    : numReplies > 0
                    ? `${numReplies} ${numReplies === 1 ? 'reply' : 'replies'}`
                    : 'Reply'}
                </button>
              )}

              {type === 'LastReply' && (
                <button
                  type="button"
                  onClick={replyClicked}
                  className="flex items-center gap-1"
                  style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: `${t.ink}60` }}
                >
                  <MessageSquare size={13} />
                  Reply
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentHeader;
