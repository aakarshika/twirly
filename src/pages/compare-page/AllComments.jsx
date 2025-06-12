import React, { useState } from 'react';
import CommentForm from '../../components/common/comments/CommentForm';
import { useComments } from '../../hooks/useComments';
import LoadingOrError from '../../components/common/LoadingOrError';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/common/Avatar';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { renderTextWithMentions } from '../../lib/commentUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Comment = ({ comment, onReply, onLikeComment, onLikeReply, users, items, userPreferences }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const isLiked = (reactions) => {
    return reactions?.find(r => r.user_id === user?.id)?.reaction_type === 'like';
  };

  const getLikeCount = (reactions) => {
    return reactions?.filter(r => r.reaction_type === 'like').length || 0;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-2" onClick={() => navigate(`/user/${comment.user?.display_name}`)}>
        <Avatar
          size="sm"
          className="w-4 h-4"
          profileImageUrl={comment.user?.profile_image_url}
          displayName={comment.user?.display_name}
        />
        <span className="font-semibold text-xs">{comment.user?.display_name}</span>
        <span className="text-xs text-gray-400 text-left">
          {formatDistanceToNow(new Date(comment.created_at ? comment.created_at : new Date()) )}
        </span>
      </div>
      <div className="ml-6 text-sm mt-1">
        <p className="text-sm mt-1 text-gray-700 dark:text-gray-300 text-left">
          <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(comment.text, items) }} />
        </p>
      </div>
      <div className="ml-6 flex items-center gap-4 mt-2">
        <button 
          onClick={() => onLikeComment(comment.id)}
          className={`flex items-center gap-1 ${isLiked(comment.reactions) ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
        >
          <Heart className={`w-4 h-4 inline-block ${isLiked(comment.reactions) ? 'fill-current' : ''}`} />
          <span className="text-xs">{getLikeCount(comment.reactions)}</span>
        </button>
        <button 
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="text-gray-500 hover:text-blue-500 text-xs"
        >
          Reply
        </button>
        {comment.replies && comment.replies.length > 0 && (
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="text-gray-500 hover:text-blue-500 text-xs"
          >
            {showReplies ? 'Hide Replies' : `Show ${comment.replies.length} Replies`}
          </button>
        )}
      </div>
      
      {showReplyInput && (
        <div className="ml-6 mt-2">
          <CommentForm
            newComment={replyText}
            setNewComment={setReplyText}
            users={users}
            items={items}
            userPreferences={userPreferences}
            handleSubmitComment={handleSubmitReply}
            type="Reply"
          />
        </div>
      )}

      {showReplies && comment.replies.length > 0 && (
        <div className="ml-6 mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-lg p-2">
              <div className="flex items-center gap-2" onClick={() => navigate(`/user/${reply.user?.display_name}`)}>
                <Avatar
                  size="xs"
                  className="w-4 h-4"
                  profileImageUrl={reply.user?.profile_image_url}
                  displayName={reply.user?.display_name}
                />
                <span className="font-semibold text-xs">{reply.user?.display_name}</span>
              </div>
              <div className="ml-6 text-sm mt-1">
                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300 text-left">
                  <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(reply.text, items) }} />
                </p>
              </div>
              <div className="ml-6 flex items-center gap-4 mt-2">
                <button 
                  onClick={() => onLikeReply(reply.id)}
                  className={`flex items-center gap-1 ${isLiked(reply.reactions) ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                >
                  <Heart className={`w-4 h-4 inline-block ${isLiked(reply.reactions) ? 'fill-current' : ''}`} />
                  <span className="text-xs">{getLikeCount(reply.reactions)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TopComment = ({ commentsCollapsed, setCommentsCollapsed, comments, items }) => {
  const { userPreferences } = useAuth();
  if (!comments.length) return (
    <div className="p-3" >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Comments <span className='text-gray-500 text-sm'>{comments.length}</span></span>
      </div>
      <div className="rounded-lg bg-gray-50 text-gray-500 p-3" onClick={() => setCommentsCollapsed(false)}>
        <div className="flex items-center gap-2">
          <Avatar
            size="sm"
            className="w-4 h-4"
            profileImageUrl={userPreferences?.profile_image_url}
            displayName={userPreferences?.display_name}
          />
          <span className="font-semibold text-xs"> {userPreferences?.display_name}</span>
        </div>
        <div className="ml-6 text-sm mt-1">Be the first to comment...</div>
      </div>
    </div>
  );;
  
  const topComment = comments[0];
  return (
    <div className="p-3 min-h-40" >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Comments <span className='text-gray-500 text-sm'>{comments.length}</span></span>
      </div>
      <div className="rounded-lg bg-gray-50 p-3" onClick={() => setCommentsCollapsed(false)}>
        <div className="flex items-center gap-2">
          <Avatar
            size="xs"
            className="w-4 h-4"
            profileImageUrl={topComment.user?.profile_image_url}
            displayName={topComment.user?.display_name}
          />
          <span className="font-semibold text-xs">{topComment.user?.display_name}</span>
          <span className="text-xs text-gray-400 text-left">
            {formatDistanceToNow(new Date(topComment.created_at ? topComment.created_at : new Date()) )}
          </span>
          </div>
        <div className="ml-6 text-sm mt-1">
          <p className="text-sm mt-1 text-gray-700 dark:text-gray-300 text-left">
            <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(topComment.text, items) }} />
          </p>
        </div>
        
      <div className="ml-6 flex items-center gap-4 mt-2">
        <button 
          className={`flex items-center gap-1 ${ 'text-gray-500 hover:text-blue-500'}`}
        >
          <Heart className={`w-4 h-4 inline-block `} />
          <span className="text-xs">{topComment.reactions?.length || 0}</span>
        </button>
        {topComment.replies && topComment.replies.length > 0 && (
          <button 
            className="text-gray-500 hover:text-blue-500 text-xs"
          >
            {`${topComment.replies.length} Replies`}
          </button>
        )}
      </div>
      </div>
    </div>
  );
};

const AllComments = ({ commentsCollapsed, setCommentsCollapsed, setId, items, users, userPreferences }) => {
  const [showNewCommentInput, setShowNewCommentInput] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { currentTheme } = useTheme();
  const {
    comments,
    loading,
    error,
    handleLikeComment,
    handleLikeReply,
    handleSubmitComment,
    handleReply
  } = useComments(setId);

  if (loading || !items  || items.length === 0) {
    return <LoadingOrError type="loading" />;
  }

  if (error || !items || items.length === 0) {
    return <LoadingOrError type="error" />;
  }

  if (commentsCollapsed) {
    return (
      <TopComment 
        commentsCollapsed={commentsCollapsed} 
        setCommentsCollapsed={setCommentsCollapsed}
        comments={comments}
        items={items}
      />
    );
  }

  return (
    <div className="min-h-full">
      <div className="fixed flex w-full items-center justify-between px-4 py-1 z-20" style={{ backgroundColor: currentTheme.colors.background }}>
      <span className="font-semibold">Comments <span className='text-gray-500 text-sm'>{comments.length}</span></span>
      <button onClick={() => setCommentsCollapsed(true)} className="ml-auto text-2xl">×</button>
      </div>

      <div className="mb-4 p-3 pt-12">
        {showNewCommentInput ? (
          <CommentForm
            newComment={newComment}
            setNewComment={setNewComment}
            handleSubmitComment={() => {
              handleSubmitComment(newComment);
              setNewComment('');
              setShowNewCommentInput(false);
            }}
            type="Comment"
            users={users}
            items={items}
            userPreferences={userPreferences}
          />
        ) : (
          <button
            onClick={() => setShowNewCommentInput(true)}
            className="w-full p-2 border border-gray-300 rounded-lg text-left text-gray-500 hover:border-blue-500"
          >
            Write a comment...
          </button>
        )}
      </div>

      <div className="space-y-3 p-3 pb-32">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            onLikeComment={handleLikeComment}
            onLikeReply={handleLikeReply}
            users={users}
            items={items}
            userPreferences={userPreferences}
          />
        ))}
      </div>
      <div className="flex justify-center items-center h-10 mb-10"> . . . </div>
    </div>
  );
};

export default AllComments; 