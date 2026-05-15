import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { useComments } from '../../hooks/useComments';
import CommentForm from '../../components/common/comments/CommentForm';
import Avatar from '../../components/common/Avatar';
import { getPublicUrl } from '../../lib/utils';
import { renderTextWithMentions } from '../../lib/commentUtils';

const isLiked = (reactions, userId) =>
  reactions?.some(r => r.user_id === userId && r.reaction_type === 'like');

const getLikeCount = reactions =>
  reactions?.filter(r => r.reaction_type === 'like').length ?? 0;

const Reply = ({ reply, onLikeReply, userId, items, t }) => {
  const navigate = useNavigate();
  return (
    <div
      className="rounded-sm p-2"
      style={{ background: t.bg, border: `1px solid ${t.ink}0c` }}
    >
      <button
        type="button"
        className="flex items-center gap-2"
        onClick={() => navigate(`/user/${reply.user?.display_name}`)}
      >
        <Avatar
          size="xs"
          profileImageUrl={getPublicUrl(reply.user?.profile_image_url)}
          displayName={reply.user?.display_name}
        />
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: t.ink, fontWeight: 600 }}>
          {reply.user?.display_name}
        </span>
      </button>
      <p
        className="ml-6 mt-1 text-left"
        style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.ink }}
        dangerouslySetInnerHTML={{ __html: renderTextWithMentions(reply.text, items) }}
      />
      <div className="ml-6 flex items-center gap-3 mt-2">
        <button
          type="button"
          className="flex items-center gap-1"
          onClick={() => onLikeReply(reply.id)}
          style={{ color: isLiked(reply.reactions, userId) ? t.red : `${t.ink}50` }}
        >
          <Heart size={13} fill={isLiked(reply.reactions, userId) ? 'currentColor' : 'none'} />
          <span style={{ fontFamily: '"Caveat", cursive', fontSize: 12 }}>
            {getLikeCount(reply.reactions)}
          </span>
        </button>
      </div>
    </div>
  );
};

const Comment = ({ comment, onReply, onLikeComment, onLikeReply, users, items, userPreferences, t }) => {
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

  return (
    <div
      className="rounded-sm p-3"
      style={{ background: t.bgDeep, border: `1px solid ${t.ink}0e` }}
    >
      <button
        type="button"
        className="flex items-center gap-2"
        onClick={() => navigate(`/user/${comment.user?.display_name}`)}
      >
        <Avatar
          size="sm"
          profileImageUrl={getPublicUrl(comment.user?.profile_image_url)}
          displayName={comment.user?.display_name}
        />
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: t.ink, fontWeight: 600 }}>
          {comment.user?.display_name}
        </span>
        <span style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: `${t.ink}55` }}>
          {formatDistanceToNow(new Date(comment.created_at ?? new Date()))}
        </span>
      </button>

      <p
        className="ml-6 mt-1 text-left"
        style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.ink }}
        dangerouslySetInnerHTML={{ __html: renderTextWithMentions(comment.text, items) }}
      />

      <div className="ml-6 flex items-center gap-4 mt-2">
        <button
          type="button"
          className="flex items-center gap-1"
          onClick={() => onLikeComment(comment.id)}
          style={{ color: isLiked(comment.reactions, user?.id) ? t.red : `${t.ink}50` }}
        >
          <Heart size={13} fill={isLiked(comment.reactions, user?.id) ? 'currentColor' : 'none'} />
          <span style={{ fontFamily: '"Caveat", cursive', fontSize: 12 }}>
            {getLikeCount(comment.reactions)}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setShowReplyInput(v => !v)}
          style={{ color: `${t.ink}50` }}
        >
          <MessageSquare size={13} />
        </button>
        {comment.replies?.length > 0 && (
          <button
            type="button"
            onClick={() => setShowReplies(v => !v)}
            style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: `${t.ink}55` }}
          >
            {showReplies ? 'hide replies' : `${comment.replies.length} replies`}
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
        <div className="ml-6 mt-3 flex flex-col gap-2">
          {comment.replies.map(reply => (
            <Reply
              key={reply.id}
              reply={reply}
              onLikeReply={onLikeReply}
              userId={user?.id}
              items={items}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TopComment = ({ setCommentsCollapsed, comments, items, userPreferences, t }) => {
  if (!comments.length) {
    return (
      <div className="p-3 pb-8">
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: `${t.ink}60` }}>
          Comments <span style={{ color: `${t.ink}40` }}>0</span>
        </span>
        <button
          type="button"
          className="flex items-center gap-2 w-full mt-2 rounded-sm p-3 text-left"
          style={{ background: t.bgDeep, border: `1px solid ${t.ink}0e` }}
          onClick={() => setCommentsCollapsed(false)}
        >
          <Avatar
            size="sm"
            profileImageUrl={getPublicUrl(userPreferences?.profile_image_url)}
            displayName={userPreferences?.display_name}
          />
          <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: `${t.ink}50` }}>
            be the first to comment…
          </span>
        </button>
      </div>
    );
  }

  const topComment = comments[0];
  return (
    <div className="p-3" style={{ minHeight: 144 }}>
      <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: `${t.ink}60` }}>
        Comments <span style={{ color: `${t.ink}40` }}>{comments.length}</span>
      </span>
      <button
        type="button"
        className="w-full mt-2 rounded-sm p-3 text-left"
        style={{ background: t.bgDeep, border: `1px solid ${t.ink}0e` }}
        onClick={() => setCommentsCollapsed(false)}
      >
        <div className="flex items-center gap-2">
          <Avatar
            size="xs"
            profileImageUrl={getPublicUrl(topComment.user?.profile_image_url)}
            displayName={topComment.user?.display_name}
          />
          <span style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: t.ink, fontWeight: 600 }}>
            {topComment.user?.display_name}
          </span>
          <span style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: `${t.ink}55` }}>
            {formatDistanceToNow(new Date(topComment.created_at ?? new Date()))}
          </span>
        </div>
        <p
          className="ml-6 mt-1 text-left"
          style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.ink }}
          dangerouslySetInnerHTML={{ __html: renderTextWithMentions(topComment.text, items) }}
        />
      </button>
    </div>
  );
};

const AllComments = ({ commentsCollapsed, setCommentsCollapsed, setId, items, users, userPreferences }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
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
    return (
      <div className="flex flex-col gap-3 p-3">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="rounded-sm"
            style={{ height: 72, background: t.bgDeep }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm p-4 m-3" style={{ background: t.bgDeep, border: `1px solid ${t.red}40` }}>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.red }}>
          {error}
        </p>
      </div>
    );
  }

  if (commentsCollapsed) {
    return (
      <TopComment
        setCommentsCollapsed={setCommentsCollapsed}
        comments={comments}
        items={items}
        userPreferences={userPreferences}
        t={t}
      />
    );
  }

  return (
    <div className="min-h-full">
      <div
        className="sticky top-0 flex w-full items-center justify-between px-4 py-2 z-20"
        style={{ background: t.bg, borderBottom: `1px solid ${t.ink}0c` }}
      >
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: `${t.ink}70` }}>
          Comments{' '}
          <span style={{ color: `${t.ink}45` }}>{comments.length}</span>
        </span>
        <button
          type="button"
          onClick={() => setCommentsCollapsed(true)}
          style={{ fontFamily: '"DM Serif Display", serif', fontSize: 22, color: `${t.ink}60`, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      <div className="flex flex-col gap-3 p-3 pb-32">
        <div className="rounded-sm p-3" style={{ background: t.bgDeep, border: `1px solid ${t.ink}0e` }}>
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
        {comments.map(comment => (
          <Comment
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            onLikeComment={handleLikeComment}
            onLikeReply={handleLikeReply}
            users={users}
            items={items}
            userPreferences={userPreferences}
            t={t}
          />
        ))}
      </div>

      <p
        className="flex justify-center items-center h-10 mb-10"
        style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}40` }}
      >
        all caught up
      </p>
    </div>
  );
};

export default AllComments;
