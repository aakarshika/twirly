import React from 'react';
import Comment from './Comment';
import Reply from './Reply';

const CommentList = ({ comment, handleLikeComment, handleReply, commentVisibility, setCommentVisibility }) => {
  const toggleVisibility = () => {
    setCommentVisibility(prev => ({
      ...prev,
      [comment.id]: !prev[comment.id]
    }));
  };

  return (
    <div className="space-y-1">
      <Comment
        comment={comment}
        onLike={handleLikeComment}
        onReply={handleReply}
        onToggleVisibility={toggleVisibility}
        isVisible={commentVisibility[comment.id]}
      />
    </div>
  );
};

export default CommentList;
