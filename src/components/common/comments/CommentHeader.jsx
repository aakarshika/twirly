import React, { useState, useRef } from 'react';
import { Circle, Dot, Heart, MessageSquare } from 'lucide-react';
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
  const display_name_clipped = display_name ? display_name.slice(0, 25) : 'Anonymous';

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-start gap-1">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div style={{scale: '0.9'}}>
            <Avatar
              profileImageUrl={profile_image_url ? getPublicUrl(profile_image_url) : null}
              displayName={display_name_clipped}
              size="sm"
            />
            </div>
          <div className="flex flex-row items-center gap-1">
            <span 
              className="text-sm font-medium cursor-pointer hover:underline text-left"
              style={{ color: currentTheme.colors.text }}
              onClick={() => navigate(`/user/${display_name}`)}
            >
              {display_name_clipped || 'Anonymous'}
            </span>
            <Circle className="w-1 h-1 text-gray-400 ml-4" fill='lightgray' /> 
            <span className="text-xs text-gray-400 text-left">
              {formatDistanceToNow(new Date(created_at ? created_at : new Date()) )}
            </span>
          </div>
          </div>

          {text && (<p className="text-sm mt-1 text-gray-700 dark:text-gray-300 text-left">
            <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(text, itemColorCoding) }} />
          </p>)}

          { (type === 'Reply' || type === 'LastReply') && (<div className="flex items-center gap-4 mt-2 mb-4 ">
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
          </div>)}
        </div>
      </div>
    </div>
  );
};

export default CommentHeader;