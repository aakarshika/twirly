import React from 'react';
import { MessageSquare } from 'lucide-react';

const CommentForm = ({ newComment, setNewComment, handleSubmitComment }) => {
  return (
    <form onSubmit={handleSubmitComment} className="mb-6">
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
        rows={3}
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-300 transition-colors flex items-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Post Comment
      </button>
    </form>
  );
};

export default CommentForm;
