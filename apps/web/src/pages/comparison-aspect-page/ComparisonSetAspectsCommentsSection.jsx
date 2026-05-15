import React, { useState } from 'react';
import { MessageSquareMore, X } from 'lucide-react';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import CommentForm from '../../components/common/comments/CommentForm';
import Comment from '../../components/common/comments/Comment';
import LoadingOrError from '../../components/common/LoadingOrError';
import { useComparisonSetAspectsComments } from '../../hooks/useComparisonSetAspectsComments';

const ComparisonSetAspectsCommentsSection = ({ aspectSetId, items, _aspectSet }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
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

  if (loading) return <LoadingOrError type="loading" />;
  if (error) return <LoadingOrError type="error" />;

  if (!isExpanded) {
    return (
      <button
        type="button"
        className="w-full text-left rounded-sm p-3"
        onClick={() => setIsExpanded(true)}
        style={{ background: `${t.bg}cc`, border: `1px solid ${t.ink}0e`, minHeight: 44 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <MessageSquareMore size={14} style={{ color: t.red }} />
          <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: `${t.ink}70` }}>
            comments
          </span>
          <span style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: t.red }}>
            {comments.length}
          </span>
        </div>

        {comments.length > 0 ? (
          <Comment
            comment={comments[0]}
            onLike={handleLikeComment}
            onToggleVisibility={() => {}}
            isVisible
            items={items}
            users={users}
            handleReply={handleReply}
            userPreferences={userPreferences}
          />
        ) : (
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}45` }}>
            no comments yet — tap to add one
          </p>
        )}
      </button>
    );
  }

  return (
    <div className="relative flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareMore size={14} style={{ color: t.red }} />
          <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: `${t.ink}70` }}>
            comments
          </span>
          <span style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: t.red }}>
            {comments.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="p-2 rounded-full"
          style={{ minHeight: 36, minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} style={{ color: `${t.ink}70` }} />
        </button>
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

      <div className="flex flex-col gap-4">
        {comments.map(comment => (
          <Comment
            key={comment.id}
            comment={comment}
            onLike={handleLikeComment}
            onToggleVisibility={() =>
              setCommentVisibility(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))
            }
            isVisible={commentVisibility[comment.id]}
            items={items}
            users={users}
            handleReply={handleReply}
            userPreferences={userPreferences}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: t.mustard,
              color: t.ink,
              fontFamily: '"Fraunces", serif',
              fontSize: 14,
              borderRadius: 2,
              minHeight: 44,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'loading…' : 'load more'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ComparisonSetAspectsCommentsSection;
