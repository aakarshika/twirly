import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { MessageSquareMore, X } from 'lucide-react';
import Button from '../../components/common/Button';
import CommentForm from '../../components/common/comments/CommentForm';
import Comment from '../../components/common/comments/Comment';
import LoadingOrError from '../../components/common/LoadingOrError';
import { useComparisonSetAspectsComments } from '../../hooks/useComparisonSetAspectsComments';
import { changeColorAlpha } from '../../lib/utils';

const ComparisonSetAspectsCommentsSection = ({ aspectSetId, items, _aspectSet, _handleLikeComparisonAspectSet }) => {
  const { currentTheme } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

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
    users,
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

  if (!isExpanded) {
    return (
      <div className="cursor-pointer" onClick={() => setIsExpanded(true)} style={{ opacity: 0.8, backgroundColor: changeColorAlpha(currentTheme.colors.background, 0.5) }}>
        <div className="rounded-lg p-1 hover:bg-gray-100 transition-colors">

        <div className="flex flex-row items-start justify-start">
      <h4 className="text-md text-gray-500 items-center">
        <span style={{ color: currentTheme.colors.primary }}><MessageSquareMore  className="w-5 h-5 inline-block" /> </span> Comments <span className="text-gray-500 text-xs ml-2" style={{ color: currentTheme.colors.primary }}>{comments.length}</span>
        </h4>
        </div>
          {comments.length > 0 ? (
            <Comment
              comment={comments[0]}
              onLike={handleLikeComment}
              onToggleVisibility={() => {}}
              isVisible={true}
              items={items}
              users={users}
              handleReply={handleReply}
              userPreferences={userPreferences}
            />
          ) : (
            <div className="text-gray-500 text-sm italic">No comments yet. Click to add one.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(false)}
        className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full"
      >
        <X size={20} />
      </button>

      <div className="flex flex-row items-start justify-start">
      <h4 className="text-md font-medium text-gray-600 mb-2  items-center">
      <span style={{ color: currentTheme.colors.primary }}><MessageSquareMore size={14} className="mr-1 inline-block" /> </span> Comments <span className="text-gray-500 text-xs ml-2" style={{ color: currentTheme.colors.primary }}>{comments.length}</span>
      </h4>
        </div>
      <CommentForm
        newComment={newComment}
        setNewComment={setNewComment}
        handleSubmitComment={onSubmitComment}
        users={users}
        items={items}
        userPreferences={userPreferences}
        type="Comment"
      />

      <div className="mt-4">
        {comments.map(comment => {
          const toggleVisibility = () => {
            setCommentVisibility(prev => ({
              ...prev,
              [comment.id]: !prev[comment.id],
            }));
          };
          return (
            <div key={comment.id} className="mb-4">
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
        <div className="flex justify-center mt-4">
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
