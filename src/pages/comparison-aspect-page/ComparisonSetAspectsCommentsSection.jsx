import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChartArea } from 'lucide-react';
import Button from '../../components/common/Button';
import CommentForm from '../../components/common/comments/CommentForm';
import Comment from '../../components/common/comments/Comment';
import CommentHeader from '../../components/common/comments/CommentHeader';
import LoadingOrError from '../../components/common/LoadingOrError';
import { useNavigate } from 'react-router-dom';
import { useComparisonSetAspectsComments } from '../../hooks/useComparisonSetAspectsComments';

const ComparisonSetAspectsCommentsSection = ({ userVoted, aspectSetId, items, aspectSet, handleLikeComparisonAspectSet }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  
  const {
    comments,
    loading,
    error,
    commentVisibility,
    setCommentVisibility,
    handleSubmitComment,
    handleLikeComment,
    loadMore,
    handleReply,
    hasMore,
    userPreferences,
    users
  } = useComparisonSetAspectsComments(aspectSetId);

  const onSubmitComment = () => {
    handleSubmitComment(newComment);
    setNewComment('');
  };

  if (loading) {
    return <LoadingOrError type="loading" />;
  }

  if (error) {
    return <LoadingOrError type="error" />;
  }

  return userVoted &&  (
        <div className="">
          <CommentForm
            newComment={newComment}
            setNewComment={setNewComment}
            handleSubmitComment={onSubmitComment}
            users={users}
            items={items}
            userPreferences={userPreferences}
            type="Comment"
          />

          <div className="">
            {comments.map((comment) => {
              const toggleVisibility = () => {
                setCommentVisibility(prev => ({
                  ...prev,
                  [comment.id]: !prev[comment.id]
                }));
              };
              return (
                <div key={comment.id} className="">
                  <Comment
                    comment={comment}
                    onLike={handleLikeComment}
                    onToggleVisibility={toggleVisibility}
                    isVisible={commentVisibility[comment.id]}
                    items={items}
                    users={users}
                    handleReply={handleReply}
                    userPreferences={userPreferences}
                  />
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button 
                onClick={loadMore} 
                disabled={loading}
                className="px-6 py-2 bg-amber-400 text-black font-medium rounded-md hover:bg-amber-300 transition-colors"
              >
                {loading ? 'Loading comments...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      );
};

export default ComparisonSetAspectsCommentsSection;
