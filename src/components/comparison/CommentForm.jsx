import React from 'react';
import { MessageSquare } from 'lucide-react';

const CommentForm = ({ newComment, setNewComment, handleSubmitComment }) => {
  return (
    <form onSubmit={handleSubmitComment} className="mb-4">
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-amber-400 focus:border-transparent transition-all"
        rows={2}
      />
      <button
        type="submit"
        className="mt-1 px-3 py-1.5 bg-amber-400 text-black rounded font-medium hover:bg-amber-300 transition-colors flex items-center gap-1.5 text-sm"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Post Comment
      </button>
    </form>
  );
};

export default CommentForm;
