import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
// eslint-disable-next-line react/default-props-match-prop-types
import { MentionsInput, Mention } from 'react-mentions';
import { supabase } from '../../lib/supabase';

const CommentForm = ({ newComment, setNewComment, handleSubmitComment }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users for mentions
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('user_id, display_name, username')
        .limit(10);

      if (!error && data) {
        setUsers(data.map(user => ({
          id: user.user_id,
          display: user.display_name || user.username,
          username: user.username
        })));
      }
    };

    fetchUsers();
  }, []);

  const mentionStyles = {
    control: {
      backgroundColor: 'white',
      fontSize: 14,
      fontWeight: 'normal',
    },
    input: {
      margin: 0,
      padding: '8px',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      color: '#1a202c',
      '&:focus': {
        borderColor: '#f59e0b',
        boxShadow: '0 0 0 1px #f59e0b',
      },
    },
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '0.375rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      item: {
        padding: '8px 12px',
        '&focused': {
          backgroundColor: '#f3f4f6',
        },
      },
    },
  };

  const renderSuggestion = (suggestion, search, highlightedDisplay) => (
    <div className="flex items-center gap-2">
      <span className="font-medium">{highlightedDisplay}</span>
      <span className="text-gray-500 text-sm">@{suggestion.username}</span>
    </div>
  );

  return (
    <form onSubmit={handleSubmitComment} className="mb-4">
      <MentionsInput
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        style={mentionStyles}
        placeholder="Add a comment... (use @ to mention users)"
        className="w-full"
      >
        <Mention
          trigger="@"
          data={users}
          renderSuggestion={renderSuggestion}
          className="bg-amber-100 text-amber-800 rounded px-1"
          appendSpaceOnAdd={true}
          displayTransform={(id, display) => `@${display}`}
        />
      </MentionsInput>
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
