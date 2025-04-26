import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useComments } from '../../hooks/useComments';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { useTheme } from '../../contexts/ThemeContext';
import { Heart, MessageSquare } from 'lucide-react';
import Button from '../common/Button';
import { getPublicUrl } from '../../lib/utils';
const ComparisonSetCommentsSection = ({ setId, items, aspectSet }) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [products] = useState(() => items.map(item => item.name));
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
    <div className="space-y-2" >
      <div className="text-center" >
        <div className="flex ">
          <img
            src={getPublicUrl(aspectSet?.comparison_sets?.user?.profile_image_url)}
            alt={aspectSet?.comparison_sets?.user?.display_name || 'User'}
            className="w-8 h-8 rounded-full mr-2"
          />

          <div className="flex">
            <span className="font-bold text-lg">{aspectSet?.comparison_sets?.user?.display_name || 'Anonymous'}</span>
            <span><div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '8px', background: 'lightgray' }}></div></span>
            <span className="font-normal text-xs text-gray-400 dark:text-gray-300" style={{ marginTop: '2px' }}>
              {new Date(aspectSet?.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex">
          <div className="text-start ml-4 mb-4">
            <h1 className="text-sm font-normal">{aspectSet?.comparison_sets?.description}</h1>
          </div>
        </div>

        <div className="text-start ml-4 mb-4" style={{ backgroundColor: 'white', borderRadius: '4px' }}>
          
          <div className="flex gap-3 mb-2">
            <button onClick={() => onLike(aspectSet?.id)} className={`flex gap-1 text-xs ${aspectSet?.userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
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

        {hasMore && (
          <div className="text-start ml-4 mb-4" style={{ backgroundColor: 'white', borderRadius: '4px' }}>
            <Button onClick={loadMore} disabled={loading}>
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonSetCommentsSection;
