import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getUserComments } from '../../../services/comments';
import { useAuth } from '../../../contexts/AuthContext';

const CommentCard = ({ comment }) => {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 
              className="font-semibold text-lg"
              style={{ color: currentTheme.colors.text }}
            >
              {comment.comparisonSetName}
            </h3>
            <p 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {comment.category}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {comment.isEdited && (
              <span 
                className="text-xs"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                (edited)
              </span>
            )}
          </div>
        </div>
        
        <p 
          className="mb-4"
          style={{ color: currentTheme.colors.text }}
        >
          {comment.text}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-sm">👍</span>
              <span 
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {comment.likes}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm">👎</span>
              <span 
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {comment.dislikes}
              </span>
            </div>
            {comment.type === 'comment' && (
              <div className="flex items-center space-x-1">
                <span className="text-sm">💬</span>
                <span 
                  className="text-sm"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {comment.replies}
                </span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span className="text-sm">✏️</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span className="text-sm">🗑️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommentsTab = ({  }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      if (!user) {
        setError('You must be logged in to view your comments');
        setLoading(false);
        return;
      }

      try {
        const data = await getUserComments(user.id);
        setComments(data);
      } catch (err) {
        setError('Failed to fetch comments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-2xl font-bold"
          style={{ color: currentTheme.colors.text }}
        >
          Your Comments
        </h2>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentsTab; 