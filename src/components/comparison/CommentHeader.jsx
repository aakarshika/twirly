import React, { useState, useRef } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { getPublicUrl, renderTextWithMentions } from '../../lib/utils';

const CommentHeader = ({ onLike, isReplySectionExpanded, replyClicked,
    type,
    profile_image_url,
    display_name,
    created_at,
    text,
    userReaction,
    reactions,
    numReplies
 }) => {
  
  return (
      <>
      <div className="flex">
      
        {(profile_image_url && profile_image_url != '') ? (<img
          src={getPublicUrl(profile_image_url)}
          alt={display_name || 'User'}
          className="w-8 h-8 rounded-full mr-2"
          onError={(e) => {
            e.target.src = '/images/default-profile-pic.png';
          }}
        />) : (<img
          src={'/images/default-profile-pic.png'}
          alt={display_name || 'User'}
          className="w-8 h-8 rounded-full mr-2"
        />)}

        <div className="flex flex justify-start">
          <span className="font-bold text-sm">{display_name || 'Anonymous'}</span>
          <span><div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '8px', background: 'lightgray' }}></div></span>
          <span className="font-normal text-xs text-gray-400 dark:text-gray-300" style={{ marginTop: '2px' }}>
            {new Date(created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <p className="ml-10 text-sm text-gray-700 dark:text-gray-300" style={{ textAlign: 'start' }}>
        <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(text) }} />
      </p>
      <div className="ml-10 flex items-center gap-3 mb-2">
        <button onClick={() => onLike(id)} className={`flex items-center gap-1 text-xs ${userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
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
          <MessageSquare className="w-3.5 h-3.5" />
            @Reply
        </button>
        )}
      </div>
      </>
  );
};

export default CommentHeader;