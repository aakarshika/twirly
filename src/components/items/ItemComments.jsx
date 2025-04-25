import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ItemComments = ({ itemId }) => {
  const { theme } = useTheme();
  const [newComment, setNewComment] = useState('');

  // This would be fetched from your API
  const comments = [
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/40',
      },
      text: 'This is a great product! I love how it performs.',
      likes: 12,
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        avatar: 'https://via.placeholder.com/40',
      },
      text: "I've been using this for a month now and it's been amazing.",
      likes: 8,
      timestamp: '5 hours ago',
    },
  ];

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      // Handle comment submission
      console.log('Submitting comment:', newComment);
      setNewComment('');
    }
  };

  const CommentCard = ({ comment }) => (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <div className="flex items-start space-x-3">
        <img
          src={comment.user.avatar}
          alt={comment.user.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {comment.user.name}
            </span>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {comment.timestamp}
            </span>
          </div>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {comment.text}
          </p>
          <div className="flex items-center mt-2">
            <button
              className={`flex items-center space-x-1 ${
                theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm">{comment.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Comments
      </h2>

      <form onSubmit={handleSubmitComment} className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className={`w-full p-2 rounded-lg resize-none focus:outline-none ${
              theme === 'dark'
                ? 'bg-gray-700 text-white placeholder-gray-400'
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            }`}
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Post Comment
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default ItemComments; 