import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useComments } from '../../hooks/useComments';
import CommentForm from './CommentForm';
import { useTheme } from '../../contexts/ThemeContext';
import { Heart, MessageSquare } from 'lucide-react';
import Button from '../common/Button';
import Comment from './Comment';
const ComparisonSetAspectsCommentsSection = ({ aspectSetId, items, aspectSet }) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [isReplySectionExpanded, setIsReplySectionExpanded] = useState(false);

  const {
    comments,
    loading,
    error,
    commentVisibility,
    setCommentVisibility,
    handleSubmitComment,
    handleLikeComment,
    handleReply,
    loadMore,
    hasMore
  } = useComments(aspectSetId, user?.id);

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
    <div className="space-y-2" >
      <div className="text-center" >
        <div className="text-start mb-4" style={{ backgroundColor: 'white', borderRadius: '4px' }}>
          
          <div className="flex gap-3 mb-2">
            <button onClick={() => onLike(aspectSetId)} className={`flex gap-1 text-xs ${aspectSet?.userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
              <Heart className={`w-3.5 h-3.5 ${aspectSet?.userReaction === 'like' ? 'fill-current' : ''}`} />
              {aspectSet?.reactions ? aspectSet?.reactions.length : 0}
            </button>
            <button onClick={() => {
              setIsReplySectionExpanded(!isReplySectionExpanded);
            }} className="flex gap-1 text-xs text-gray-500 hover:text-amber-400">
              <MessageSquare className="w-3.5 h-3.5" />
              {isReplySectionExpanded ? ' Hide Replies' : comments && comments.length > 0 ? comments.length + '   Comment'+ (comments.length > 1 ? 's' : '') : ' Be the first to comment'}
            </button>
          </div>
        </div>
        {isReplySectionExpanded && (
          <div className="text-start ml-4 mb-4" style={{ backgroundColor: 'white', borderRadius: '4px' }}>
            <CommentForm
              newComment={newComment}
              setNewComment={setNewComment}
              handleSubmitComment={onSubmitComment}
            />
          </div>
        )}
        {comments.map((comment) => (
          <div key={comment.id}>
          <Comment
            comment={comment}
            onLike={handleLikeComment}
            onReply={handleReply}
            onToggleVisibility={toggleVisibility}
            isVisible={commentVisibility[comment.id]}
            products={items}
            />
          </div>
        ))}

        {hasMore && (
          <div className="text-start ml-4 mb-4" style={{ backgroundColor: 'white', borderRadius: '4px' }}>
            <Button onClick={loadMore} disabled={loading}>
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
      <div className="h-1 w-full" style={{ backgroundColor: 'gray', marginBottom: '15px' }}></div>
    </div>
  );
};

export default ComparisonSetAspectsCommentsSection;
