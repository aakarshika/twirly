import React, { useState, useRef } from 'react';
import Reply from './Reply';
import {  getPublicUrl } from '../../../lib/utils';
import useMentionInput from '../../../hooks/useMentionInput';
import { useAuth } from '../../../contexts/AuthContext';
import { userService } from '../../../services/userService';
import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import CommentForm from './CommentForm';
import { useComments } from '../../../hooks/useComments';
import CommentHeader from './CommentHeader';
const Comment = ({ comment, onLike, onReply,  isVisible,   items, users, userPreferences, handleReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isReplySectionExpanded, setIsReplySectionExpanded] = useState(comment.replies?.length > 0);
  const [newComment, setNewComment] = useState('');

  const user = userPreferences;
  const onSubmitComment = () => {
    console.log('onSubmitReply', newComment, comment.id);
    handleReply(comment.id, newComment);
    setNewComment('');
    setIsReplying(false);
    setIsReplySectionExpanded(true);
  };
  return (
    <div className="flex">
    <div className="p-2 rounded bg-white dark:bg-gray-800 w-full">
      <CommentHeader
          type="Reply"
        comment={comment}
        onLike={onLike}
        replyClicked={() => {
          setIsReplying(!isReplySectionExpanded);
          setIsReplySectionExpanded(!isReplySectionExpanded);
        }}
        profile_image_url={comment.user?.profile_image_url}
        display_name={comment.user?.display_name}
        created_at={comment.created_at}
        text={comment.text}
        setIsReplying={setIsReplying}
        userReaction={comment.userReaction}
        reactions={comment.reactions}
        objectId={comment.id}
        numReplies={comment.replies?.length}
        items={items}
      />
      <div style={{ scale: '0.9' }}>
      {isReplying && isReplySectionExpanded && (
            <CommentForm
              newComment={newComment}
              setNewComment={setNewComment}
              handleSubmitComment={() => {
                console.log('handleSubmitComment', newComment);
                onSubmitComment();
              }}
              users={users}
              items={items}
              userPreferences={userPreferences}
              type="Reply"
            />
      )}
      </div>
      <div style={{ scale: '0.9' }}>
      {isReplySectionExpanded && comment.replies?.map(reply => (
        <Reply 
          key={reply.id} 
          reply={reply} 
          onLike={onLike}
          items={items}
        />
      ))}
      </div>
    </div>
    </div>
  );
};

export default Comment;