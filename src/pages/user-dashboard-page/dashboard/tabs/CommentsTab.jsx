import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getUserComments } from '../../../../services/comments';
import { useAuth } from '../../../../contexts/AuthContext';
import { splitAndJoin } from '../../../../lib/utils';
import { renderTextWithMentions } from '../../../../lib/commentUtils';
import { formatDistanceToNow } from 'date-fns';

const CommentCard = ({ comment }) => {
  const { currentTheme } = useTheme();
  console.log(comment);
  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: currentTheme.colors.card, color: currentTheme.colors.text }}
    >
      <div className="p-4">
        
      <div className="flex justify-between items-start mb-4">
          <div
            onClick={() => {
              navigate(`/compare/${comment.comparison_set_aspects?.set_id}/aspect/${comment.comparison_set_aspects?.id}`);
            }}
          >
            <h3 
              className="font-semibold text-lg"
              style={{ color: currentTheme.colors.text }}
            >
              {comment.comparison_set_aspects?.comparison_sets?.name}
            </h3>

            <h4 
              className="text-sm rounded-md px-2 py-1"
              style={{ color: 'white', backgroundColor: currentTheme.colors.secondary}}
            >
              Based on: {splitAndJoin(comment.comparison_set_aspects?.metric_name)}
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <span 
              className="text-sm"
              style={{ color: currentTheme.colors.text }}
            >
              {formatDistanceToNow(new Date(comment.created_at).toLocaleDateString())}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300" style={{ textAlign: 'start' }}>
        <span dangerouslySetInnerHTML={{ __html: renderTextWithMentions(comment.text, []) }} />
      </p>
      </div>
    </div>
  );
};

const CommentsTab = ({ userId, isPublic }) => {
  const { currentTheme } = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      if (!userId) {
        setError('You must be logged in to view your comments');
        setLoading(false);
        return;
      }

      try {
        const data = await getUserComments(userId);
        console.log(data);
        setComments(data.comments);
      } catch (err) {
        setError('Failed to fetch comments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [userId]);

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