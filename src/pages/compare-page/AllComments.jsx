import React, { useState } from 'react';
import CommentForm from '../../components/common/comments/CommentForm';
import { useComments } from '../../hooks/useComments';
import LoadingOrError from '../../components/common/LoadingOrError';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/common/Avatar';
import { Heart, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { renderTextWithMentions } from '../../lib/commentUtils';
import { useNavigate } from 'react-router-dom';
import { getPublicUrl } from '../../lib/utils';

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

  const isLiked = (reactions) =>
    reactions?.some(r => r.user_id === user?.id && r.reaction_type === 'like');

  const getLikeCount = (reactions) =>
    reactions?.filter(r => r.reaction_type === 'like').length || 0;

  return (
    <div className="bg-surface rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-2" onClick={() => navigate(`/user/${comment.user?.display_name}`)}>
        <Avatar
          size="sm"
          className="w-4 h-4"
          profileImageUrl={getPublicUrl(comment.user?.profile_image_url)}
          displayName={comment.user?.display_name}
        />
        <span className="font-semibold text-xs">{comment.user?.display_name}</span>
        <span className="text-xs text-text-muted text-left">
          {formatDistanceToNow(new Date(comment.created_at ?? new Date()))}
        </span>
      </div>
      <div className="ml-6 text-sm mt-1">
        <p className="text-sm mt-1 text-text text-left">
          <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(comment.text, items) }} />
        </p>
      </div>
      <div className="ml-6 flex items-center gap-4 mt-2">
        <button
          onClick={() => onLikeComment(comment.id)}
          className={`flex items-center gap-1 ${isLiked(comment.reactions) ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
        >
          <Heart className={`w-4 h-4 inline-block ${isLiked(comment.reactions) ? 'fill-current' : ''}`} />
          <span className="text-xs">{getLikeCount(comment.reactions)}</span>
        </button>
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="text-text-muted hover:text-primary text-xs"
        >
          <MessageSquare className="w-4 h-4 inline-block" />
        </button>
        {comment.replies?.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-text-muted hover:text-primary text-xs"
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

      {showReplies && comment.replies?.length > 0 && (
        <div className="ml-6 mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="bg-bg rounded-lg p-2">
              <div className="flex items-center gap-2" onClick={() => navigate(`/user/${reply.user?.display_name}`)}>
                <Avatar
                  size="xs"
                  className="w-4 h-4"
                  profileImageUrl={getPublicUrl(reply.user?.profile_image_url)}
                  displayName={reply.user?.display_name}
                />
                <span className="font-semibold text-xs">{reply.user?.display_name}</span>
              </div>
              <div className="ml-6 text-sm mt-1">
                <p className="text-sm mt-1 text-text text-left">
                  <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(reply.text, items) }} />
                </p>
              </div>
              <div className="ml-6 flex items-center gap-4 mt-2">
                <button
                  onClick={() => onLikeReply(reply.id)}
                  className={`flex items-center gap-1 ${isLiked(reply.reactions) ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
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

const TopComment = ({ setCommentsCollapsed, comments, items, userPreferences }) => {
  if (!comments.length) return (
    <div className="p-3 pb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-normal text-sm text-text">
          Comments <span className="text-text-muted text-sm">{comments.length}</span>
        </span>
      </div>
      <div className="rounded-lg bg-surface text-text-muted p-3" onClick={() => setCommentsCollapsed(false)}>
        <div className="flex items-center gap-2">
          <Avatar
            size="sm"
            className="w-4 h-4"
            profileImageUrl={getPublicUrl(userPreferences?.profile_image_url)}
            displayName={userPreferences?.display_name}
          />
          <span className="font-semibold text-xs">{userPreferences?.display_name}</span>
        </div>
        <div className="ml-6 text-sm mt-1">Be the first to comment...</div>
      </div>
    </div>
  );

  const topComment = comments[0];
  return (
    <div className="p-3 min-h-36">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-normal text-sm text-text">
          Comments <span className="text-text-muted text-sm">{comments.length}</span>
        </span>
      </div>
      <div className="rounded-lg bg-surface p-3" onClick={() => setCommentsCollapsed(false)}>
        <div className="flex items-center gap-2">
          <Avatar
            size="xs"
            className="w-4 h-4"
            profileImageUrl={getPublicUrl(topComment.user?.profile_image_url)}
            displayName={topComment.user?.display_name}
          />
          <span className="font-semibold text-xs">{topComment.user?.display_name}</span>
          <span className="text-xs text-text-muted text-left">
            {formatDistanceToNow(new Date(topComment.created_at ?? new Date()))}
          </span>
        </div>
        <div className="ml-6 text-sm mt-1">
          <p className="text-sm mt-1 text-text text-left">
            <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(topComment.text, items) }} />
          </p>
        </div>
      </div>
    </div>
  );
};

const AllComments = ({ commentsCollapsed, setCommentsCollapsed, setId, items, users, userPreferences }) => {
  const [newComment, setNewComment] = useState('');
  const {
    comments,
    loading,
    error,
    handleLikeComment,
    handleLikeReply,
    handleSubmitComment,
    handleReply,
  } = useComments(setId);

  if (loading || !items || items.length === 0) {
    return <LoadingOrError type="loading" />;
  }

  if (error) {
    return <LoadingOrError type="error" />;
  }

  if (commentsCollapsed) {
    return (
      <TopComment
        setCommentsCollapsed={setCommentsCollapsed}
        comments={comments}
        items={items}
        userPreferences={userPreferences}
      />
    );
  }

  return (
    <div className="min-h-full">
      <div className="sticky top-0 flex w-full items-center justify-between px-4 py-1 z-20 bg-bg">
        <span className="font-normal text-sm text-text">
          Comments <span className="text-text-muted text-sm">{comments.length}</span>
        </span>
        <button onClick={() => setCommentsCollapsed(true)} className="ml-auto text-2xl">×</button>
      </div>

      <div className="space-y-3 p-3 pb-32">
        <div className="rounded-lg p-3 shadow-sm">
          <CommentForm
            newComment={newComment}
            setNewComment={setNewComment}
            handleSubmitComment={() => {
              handleSubmitComment(newComment);
              setNewComment('');
            }}
            type="Comment"
            users={users}
            items={items}
            userPreferences={userPreferences}
          />
        </div>
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
      <div className="flex justify-center items-center h-10 mb-10 text-text-muted">. . .</div>
    </div>
  );
};

export default AllComments;
