import React, { useState, useRef } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { getPublicUrl } from '../../../lib/utils';
import { renderTextWithMentions } from '../../../lib/commentUtils';
import { useNavigate } from 'react-router-dom';
import Avatar from '../Avatar';

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
  const itemColorCoding = items?.map(item => {
    return {
      id: item.items ? item.items.id : item.id,
      item_color_string: item.items ? item.items.item_color_string : item.item_color_string
    }
  }) || [];
  return (
      <>
      <div className="flex">
        <Avatar
          profileImageUrl={profile_image_url ? getPublicUrl(profile_image_url) : null}
          displayName={display_name}
          size="sm"
          className="mr-2"
        />
        <div className="items-start">
          <div className="flex flex-row justify-start">
            <span className="font-bold text-md "
              style={{textAlign: 'start'}}
              onClick={() => {
                navigate(`/user/${display_name}`);
              }}
              >{display_name || 'Anonymous'}
            </span>
            <span><div className="w-auto h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '8px', background: 'lightgray' }}></div></span>
            <span className="font-normal text-xs text-gray-400 dark:text-gray-300" style={{ marginTop: '2px' }}>
              {new Date(created_at).toLocaleDateString()}
            </span>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300" style={{ textAlign: 'start' }}>
            <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(text, itemColorCoding) }} />
          </p>
        </div>
      </div>
      <div className="ml-8 mt-2 flex items-center gap-3 mb-2">
        <button onClick={() => onLike(objectId, type)} className={`flex items-center gap-1 text-xs ${userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
          <Heart className={`w-3.5 h-3.5 ${userReaction === 'like' ? 'fill-current' : ''}`} />
          {reactions ? reactions.length : 0}
        </button>
        {type == 'Reply' && (
          <button onClick={() => {
            replyClicked();
          }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-400">
          <MessageSquare className="w-3.5 h-3.5" />
           {isReplySectionExpanded ? ' Hide Replies' : numReplies > 0 ? numReplies + '   Repl'+ (numReplies > 1 ? 'ies' : 'y') : ' Reply' }
        </button>
        )}
        {type == 'LastReply' && (
          <button onClick={() => {
            replyClicked();
          }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-400">
            @Reply
        </button>
        )}
      </div>
      </>
  );
};

export default CommentHeader;