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

  const users = [{ items: {name: "John Doe", id: 1}}, { items: {name: "Jane Doe", id: 2}}, { items: {name: "John_Smith", id: 3}}, { items: {name: "Jane_Smith", id: 4}}];
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
