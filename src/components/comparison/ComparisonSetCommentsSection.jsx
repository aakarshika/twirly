import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useComments } from '../../hooks/useComments';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

const ComparisonSetCommentsSection = ({ setId, items }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [products] = useState(() => items.map(item => item.name));

  const {
    comments,
    loading,
    error,
    commentVisibility,
    setCommentVisibility,
    handleSubmitComment,
    handleLikeComment,
    handleReply
  } = useComments(setId, user?.id);

  const onSubmitComment = (e) => {
    e.preventDefault();
    handleSubmitComment(newComment);
    setNewComment('');
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading comments: {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <CommentForm 
        newComment={newComment} 
        setNewComment={setNewComment} 
        handleSubmitComment={onSubmitComment} 
      />
      <div className="space-y-1">
        {comments.map((comment) => (
          <div key={comment.id}>
            <CommentList
              comment={comment}
              handleLikeComment={handleLikeComment}
              handleReply={handleReply}
              commentVisibility={commentVisibility}
              setCommentVisibility={setCommentVisibility}
              products={products}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonSetCommentsSection;
