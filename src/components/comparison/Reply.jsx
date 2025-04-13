import React from 'react';

const Reply = ({ reply }) => {
  return (
    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-2">
        <img
          src={reply.user?.profile_picture || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'}
          alt={reply.user?.username || 'User'}
          className="w-8 h-8 rounded-full mr-2"
        />
        <div className="flex flex-col">
          <span className="font-semibold">{reply.user?.username || 'Anonymous'}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(reply.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{reply.text}</p>
    </div>
  );
};

export default Reply;
