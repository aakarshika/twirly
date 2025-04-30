import React, { useState, useRef } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import {  getPublicUrl } from '../../lib/utils';
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
  
  const renderTextWithMentions = (text) => {
    if (!text) return null;
    
    // Split text by @ mentions
    const parts = text.split(/(\w+)/);
    
    let startCodeIndex = -1;
    let userName = " ";
    let nameEndIndex = -1;
    const a = parts.map((part, index) => {
      if (part == ' @['){
        startCodeIndex = index;
        userName = " ";
        nameEndIndex = -1;
        return null;
      }
      if (startCodeIndex == -1) return part;

      if (startCodeIndex+1 <= index && part != "](" ){
        userName = userName+ part;
      }
      else if(part == "]("){
        const ss = userName + " ";
        nameEndIndex = index;
        return (
          <span key={index} >
            <span className="bg-amber-100 text-amber-800 rounded px-1">
              {ss}
            </span>
          </span>
          )
      }
      if (nameEndIndex+1 <= index && index <= startCodeIndex+9){
        return null;
      }
      if (nameEndIndex+10 == index){
        startCodeIndex = -1;
        return null;
      }
      return;
    });
  
    return a;
  }
  return (
      <>
      <div className="flex">
      
        <img
          src={getPublicUrl(profile_image_url)}
          alt={display_name || 'User'}
          className="w-8 h-8 rounded-full mr-2"
        />

        <div className="flex flex justify-start">
          <span className="font-bold text-sm">{display_name || 'Anonymous'}</span>
          <span><div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '8px', background: 'lightgray' }}></div></span>
          <span className="font-normal text-xs text-gray-400 dark:text-gray-300" style={{ marginTop: '2px' }}>
            {new Date(created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <p className="ml-10 text-sm text-gray-700 dark:text-gray-300" style={{     textAlign: 'start' }}>
        {renderTextWithMentions(text)}
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