import React, { useState, useRef } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import './Reply.css';
import { getPublicUrl } from '../../lib/utils';
import useMentionInput from '../../hooks/useMentionInput';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import CommentHeader from './CommentHeader';
const Reply = ({ reply, onLike, onReply, appendText, items }) => {


  return (
    <div className="flex">    
      <div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{marginTop: '2px', background: 'lightgray'}}></div>
      <div className="p-1 w-full border-b border-gray-200 dark:border-gray-700">

        <CommentHeader
          type="LastReply"
          comment={reply}
          onLike={onLike}
          replyClicked={() => {
            console.log('replyClicked');
          }}
          profile_image_url={reply.user?.profile_image_url}
          display_name={reply.user?.username}
          created_at={reply.created_at}
          text={reply.text}
          userReaction={reply.userReaction}
          reactions={reply.reactions}
          numReplies={reply.replies?.length}
          items={items}
        />

      </div>
    </div>
  );
};

export default Reply;
