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
  } = useMentionInput(users, products);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onReply(comment.id, text);
    setText('');
    setIsReplying(false);
    setIsReplySectionExpanded(true);
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <img
          src={comment.user?.profile_picture || 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg'}
          alt={comment.user?.username || 'User'}
          className="w-10 h-10 rounded-full mr-3"
        />

        <div className="flex flex justify-start">
          <span className="font-bold  text-md">{comment.user?.username || 'Anonymous'}</span>
          <span><div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '10px', background: 'lightgray' }}></div></span>
          <span className="font-normal text-sm text-gray-400 dark:text-gray-300" style={{ marginTop: '2px' }}>
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <p className="ml-14 text-gray-700 dark:text-gray-300">{comment.text}</p>

      <div className="ml-14 flex items-center gap-4 mb-3">
        <button onClick={() => onLike(comment.id)} className={`flex items-center gap-1 text-sm ${comment.userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
          <Heart className={`w-4 h-4 ${comment.userReaction === 'like' ? 'fill-current' : ''}`} />
          {comment.reactions?.length}
        </button>
        <button onClick={() => {
          setIsReplying(!isReplying);
          setIsReplySectionExpanded(!isReplySectionExpanded);
        }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-400">
          <MessageSquare className="w-4 h-4" />
          {isReplySectionExpanded ? ' Hide Replies' : comment.replies?.length + ' '}
        </button>
      </div>

      {isReplying && isReplySectionExpanded && (
        <form onSubmit={handleReplySubmit} className="mt-2">
          <div className="flex">
            <div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '2px', background: 'lightgray' }}></div>
            <div className="p-2 w-full border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start mb-2">
                <img
                  src={comment.user?.profile_picture || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'}
                  alt={comment.user?.username || 'User'}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div className="flex flex justify-start">
                  <span className="font-bold  text-md">{comment.user?.username || 'Anonymous'}</span>
                  <span><div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '10px', background: 'lightgray' }}></div></span>
                  <span className="font-normal text-sm text-gray-400 dark:text-gray-300" style={{ marginTop: '2px' }}>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-gray-700 dark:text-gray-300 ml-10">
                <div
                  ref={contentEditableRef}
                  contentEditable
                  onInput={handleInputChange}
                  placeholder="Write a reply..."
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  style={{ minHeight: '40px', outline: 'none' }}
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
                <button type="submit" className="mt-2 px-3 py-1 bg-amber-400 text-black rounded-full text-sm font-medium hover:bg-amber-300 transition-colors">
                  Reply
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {isReplySectionExpanded && comment.replies?.map(reply => (
        <Reply key={reply.id} reply={reply} />
      ))}
    </div>
  );
};

export default Comment;