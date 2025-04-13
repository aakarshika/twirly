import React, { useState } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import Reply from './Reply';

const Comment = ({ comment, onLike, onReply, onToggleVisibility, isVisible }) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onReply(comment.id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center mb-2">
        <img
          src={comment.user?.profile_picture || 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg'}
          alt={comment.user?.username || 'User'}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {comment.user?.username || 'Anonymous'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => onLike(comment.id)} className={`flex items-center gap-1 text-sm ${comment.userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
          <Heart className={`w-4 h-4 ${comment.userReaction === 'like' ? 'fill-current' : ''}`} />
          {comment.reactions?.length}
        </button>
        <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-400">
          <MessageSquare className="w-4 h-4" />
          {comment.replies?.length}
        </button>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-3">{comment.text}</p>
      <button onClick={onToggleVisibility} className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-400 mb-2">
        <MessageSquare className="w-4 h-4" />
        {isVisible ? 'Hide Replies' : 'Show Replies'}
      </button>
      
      {isVisible && comment.replies?.map(reply => (
        <Reply key={reply.id} reply={reply} />
      ))}

      {isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            rows={2}
          />
          <button type="submit" className="mt-2 px-3 py-1 bg-amber-400 text-black rounded-full text-sm font-medium hover:bg-amber-300 transition-colors">
            Reply
          </button>
        </form>
      )}
    </div>
  );
};

export default Comment; 