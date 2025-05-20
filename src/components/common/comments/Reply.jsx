import React, { useState, useRef } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import './Reply.css';
import CommentHeader from './CommentHeader';
const Reply = ({ reply, onLike, onReply, appendText, items }) => {


  return (
    <div className="flex">    
      <div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 mr-2" style={{ background: 'lightgray'}}></div>
      <div className="w-full ">

        <CommentHeader
          type="LastReply"
          comment={reply}
          onLike={onLike}
          replyClicked={() => {
            console.log('replyClicked');
            onReply(reply);
          }}
          profile_image_url={reply.user?.profile_image_url}
          display_name={reply.user?.display_name}
          created_at={reply.created_at}
          text={reply.text}
          userReaction={reply.userReaction}
          reactions={reply.reactions}
          objectId={reply.id}
          numReplies={reply.replies?.length}
          items={items}
        />

      </div>
    </div>
  );
};

export default Reply;
