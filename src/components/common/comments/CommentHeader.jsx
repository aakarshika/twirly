import React, { useState, useRef } from 'react';
import { Dot, Heart, MessageSquare } from 'lucide-react';
import { getPublicUrl } from '../../../lib/utils';
import { renderTextWithMentions } from '../../../lib/commentUtils';
import { useNavigate } from 'react-router-dom';
import Avatar from '../Avatar';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../../../contexts/ThemeContext';

const CommentHeader = ({ onLike, isReplySectionExpanded, replyClicked,
  items,
  type,
  profile_image_url,
  display_name,
  user_id,
  created_at,
  text,
  userReaction,
  reactions,
  comment,
  objectId,
  numReplies
}) => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const itemColorCoding = items?.map(item => {
    return {
      id: item.items ? item.items.id : item.id,
      item_color_string: item.items ? item.items.item_color_string : item.item_color_string
    }
  }) || [];

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-start gap-3">
        <Avatar
          profileImageUrl={profile_image_url ? getPublicUrl(profile_image_url) : null}
          displayName={display_name}
          size="sm"
        />
        <div className="flex-1">
          <div className="flex flex-col items-start">
            <span 
              className="text-md font-medium cursor-pointer hover:underline text-left"
              style={{ color: currentTheme.colors.text }}
              onClick={() => navigate(`/user/${display_name}`)}
            >
              {display_name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-400 mt-0.5 text-left">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 text-left">
            <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(text, itemColorCoding) }} />
          </p>

          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={() => onLike(objectId, type)} 
              className={`flex items-center gap-1.5 text-xs ${userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${userReaction === 'like' ? 'fill-current' : ''}`} />
              {reactions ? reactions.length : 0}
            </button>
            
            {type === 'Reply' && (
              <button 
                onClick={replyClicked}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {isReplySectionExpanded ? 'Hide Replies' : numReplies > 0 ? `${numReplies} ${numReplies > 1 ? 'Replies' : 'Reply'}` : 'Reply'}
              </button>
            )}
            
            {type === 'LastReply' && (
              <button 
                onClick={replyClicked}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                @Reply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentHeader;