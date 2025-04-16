import React, { useState, useRef } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import Reply from './Reply';
import useMentionInput from '../hooks/useMentionInput';

const Comment = ({ comment, onLike, onReply, users, products }) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isReplySectionExpanded, setIsReplySectionExpanded] = useState(false);

  const {
    text,
    setText,
    suggestions,
    mode,
    contentEditableRef,
    handleInputChange,
    insertMention,
    appendText,
  } = useMentionInput(users, products);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onReply(comment.id, text);
    setText('');
    setIsReplying(true);
    setIsReplySectionExpanded(true);
  };

  return (
    <div className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center">
        <img
          src={comment.user?.profile_picture || 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg'}
          alt={comment.user?.username || 'User'}
          className="w-8 h-8 rounded-full mr-2"
        />

        <div className="flex flex justify-start">
          <span className="font-bold text-sm">{comment.user?.username || 'Anonymous'}</span>
          <span><div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '8px', background: 'lightgray' }}></div></span>
          <span className="font-normal text-xs text-gray-400 dark:text-gray-300" style={{ marginTop: '2px' }}>
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <p className="ml-10 text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>

      <div className="ml-10 flex items-center gap-3 mb-2">
        <button onClick={() => onLike(comment.id)} className={`flex items-center gap-1 text-xs ${comment.userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
          <Heart className={`w-3.5 h-3.5 ${comment.userReaction === 'like' ? 'fill-current' : ''}`} />
          {comment.reactions ? comment.reactions.length : 0}
        </button>
        <button onClick={() => {
          setIsReplying(!isReplying);
          setIsReplySectionExpanded(!isReplySectionExpanded);
        }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-400">
          <MessageSquare className="w-3.5 h-3.5" />
          {isReplySectionExpanded ? ' Hide Replies' : comment.replies ? comment.replies.length + '   Reply' : '0   Reply'}
        </button>
      </div>

      {isReplying && isReplySectionExpanded && (
        <form onSubmit={handleReplySubmit} className="mt-1">
          <div className="flex">
            <div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '2px', background: 'lightgray' }}></div>
            <div className="p-1 w-full border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start mb-1">
                <img
                  src={comment.user?.profile_picture || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'}
                  alt={comment.user?.username || 'User'}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <div className="flex flex justify-start">
                  <span className="font-bold text-sm">{comment.user?.username || 'Anonymous'}</span>
                  <span><div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '8px', background: 'lightgray' }}></div></span>
                  <span className="font-normal text-xs text-gray-400 dark:text-gray-300" style={{ marginTop: '2px' }}>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-gray-700 dark:text-gray-300 ml-8">
                <div
                  ref={contentEditableRef}
                  contentEditable
                  onInput={
                    (e) => {
                      handleInputChange(e.target.innerText);
                    }
                  }
                  placeholder="Write a reply..."
                  className="w-full p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  style={{ minHeight: '32px', outline: 'none' }}
                />
                {suggestions?.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((item) => (
                      <li key={item} onClick={() => insertMention(item)}>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                <button type="submit" className="mt-1 px-2 py-0.5 bg-amber-400 text-black rounded text-xs font-medium hover:bg-amber-300 transition-colors">
                  Reply
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {isReplySectionExpanded && comment.replies?.map(reply => (
        <Reply 
          key={reply.id} 
          reply={reply} 
          onLike={onLike}
          onReply={onReply}
          contentEditableRef={contentEditableRef}
          appendText={appendText}
        />
      ))}
    </div>
  );
};

export default Comment;