import React, { useState } from 'react';
import Reply from './Reply';
import CommentForm from './CommentForm';
import CommentHeader from './CommentHeader';
const Comment = ({ comment, onLike, _onReply, _isVisible, items, users, userPreferences, handleReply }) => {
  const [isReplying, setIsReplying] = useState(comment.replies?.length > 0);
  const [isReplySectionExpanded, setIsReplySectionExpanded] = useState(comment.replies?.length > 0);
  const [newComment, setNewComment] = useState('');

  const onSubmitComment = () => {
    // console.log('onSubmitReply', newComment, comment.id);
    handleReply(comment.id, newComment);
    setNewComment('');
    setIsReplying(false);
    setIsReplySectionExpanded(true);
  };
  return (
    <div className="flex">
    <div className="rounded w-full">
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
      <div className="pl-5">
      {isReplying && isReplySectionExpanded && (
            <CommentForm
              newComment={newComment}
              setNewComment={setNewComment}
              handleSubmitComment={() => {
                // console.log('handleSubmitComment', newComment);
                onSubmitComment();
              }}
              users={users}
              items={items}
              userPreferences={userPreferences}
              type="Reply"
            />
      )}
      </div>
      <div className="pl-5">
      {isReplySectionExpanded && comment.replies?.map(reply => (
        <Reply
          key={reply.id}
          reply={reply}
          onLike={onLike}
          onReply={r => {
            // console.log('onReply', r, newComment);
            setNewComment(newComment + ' @[' + r.user.display_name + '](' + r.user.user_id + ') ');
          }}
          items={items}
        />
      ))}
      </div>
    </div>
    </div>
  );
};

export default Comment;
