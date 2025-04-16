import React from 'react';
import Comment from './Comment';
import Reply from './Reply';

const CommentList = ({ comment, handleLikeComment, handleReply, commentVisibility, setCommentVisibility,  products }) => {
  const toggleVisibility = () => {
    setCommentVisibility(prev => ({
      ...prev,
      [comment.id]: !prev[comment.id]
    }));
  };

  const users = ["John_Doe", "Jane_Doe", "John_Smith", "Jane_Smith"];
  return (
    <div className="">
      <Comment
        comment={comment}
        onLike={handleLikeComment}
        onReply={handleReply}
        onToggleVisibility={toggleVisibility}
        isVisible={commentVisibility[comment.id]}
        users={users}
        products={products}
      />
    </div>
  );
};

export default CommentList;
