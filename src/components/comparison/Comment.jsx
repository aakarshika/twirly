import React, { useState, useRef } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import Reply from './Reply';
import {  getPublicUrl } from '../../lib/utils';
import useMentionInput from '../../hooks/useMentionInput';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import CommentForm from './CommentForm';
import { useComments } from '../../hooks/useComments';
import CommentHeader from './CommentHeader';
const Comment = ({ comment, onLike, onReply,  isVisible,   products, users, userPreferences, handleReply }) => {
  const [isReplying, setIsReplying] = useState(comment.replies?.length > 0);
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
    <div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{marginTop: '2px', background: 'lightgray'}}></div>
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
        numReplies={comment.replies?.length}
      />
      {isReplying && isReplySectionExpanded && (
            <CommentForm
              newComment={newComment}
              setNewComment={setNewComment}
              handleSubmitComment={() => {
                console.log('handleSubmitComment', newComment);
                onSubmitComment();
              }}
              users={users}
              userPreferences={userPreferences}
              type="Reply"
            />
      )}

      {isReplySectionExpanded && comment.replies?.map(reply => (
        <Reply 
          key={reply.id} 
          reply={reply} 
          onLike={onLike}
        />
      ))}
    </div>
    </div>
  );
};

export default Comment;