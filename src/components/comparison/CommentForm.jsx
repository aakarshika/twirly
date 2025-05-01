import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
// eslint-disable-next-line react/default-props-match-prop-types
import { MentionsInput, Mention } from 'react-mentions';
import { supabase } from '../../lib/supabase';
import { getPublicUrl } from '../../lib/utils';

const CommentForm = ({ newComment, setNewComment, handleSubmitComment, users, userPreferences, type }) => {
  const inputRef = useRef(null);
  const [focus, setFocus] = useState(false);


  const mentionStyles = {
    control: {
      backgroundColor: 'white',
      fontSize: 12,
      fontWeight: 'normal',
    },
    input: {
      fontSize: 16,
      margin: 0,
      padding: '8px',
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
    <div className="flex items-start gap-2">
      <span className="font-medium">{highlightedDisplay}</span>
      <span className="text-gray-500 text-sm">@{suggestion.username}</span>
    </div>
  );

  return (

    <div className="flex">
    <div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{marginTop: '2px', background: 'lightgray'}}></div>
    <div className="w-full p-2 bg-white">
      
    <>
      <div className="flex">
      
        <img
          src={getPublicUrl(userPreferences?.profile_image_url)}
          alt={userPreferences?.display_name || 'User'}
          className="w-8 h-8 rounded-full mr-2"
        />

        <div className="flex flex-col w-full">
          <span className="font-bold text-start text-sm">{userPreferences?.display_name || 'Anonymous'}</span>
          <div className="w-full rounded-lg"
          style={{border: '2px solid #e2e8f0'}}>
            <div  className="flex flex-col w-full">
              <MentionsInput
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={mentionStyles}
                placeholder={focus ? `${type}@user #product` : `Add ${type}...`}
                className="w-full min-h-10 h-auto rounded-lg"
                inputRef={inputRef}
                onFocus={(e) => {
                  setFocus(true);
                  console.log('focus');
                }}
              >
                <Mention
                  trigger="@"
                  data={users}
                  renderSuggestion={renderSuggestion}
                  className="bg-amber-100 text-amber-800 px-1"
                  appendSpaceOnAdd={true}
                  displayTransform={(id, display) => `@${display}`}
                />
              </MentionsInput>
              {newComment.length > 0 && (
                <div className="flex justify-start">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('handleSubmitComment', newComment);
                    handleSubmitComment();
                  }}
                  className="w-auto mt-1 px-3 py-1.5 justify-start bg-amber-400 rounded-md text-black font-small hover:bg-amber-300 transition-colors flex items-start gap-1.5 text-sm"
                >
                  {type}
                </button>
                <button
                  onClick={() => {
                    setNewComment('');
                  }}
                  className="w-auto mt-1 px-3 py-1.5 justify-start bg-white-400 rounded-md text-black font-small hover:bg-amber-300 transition-colors flex items-start gap-1.5 text-sm"
                >
                  Cancel
                </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
    </div>
    </div>
  );
};

export default CommentForm;
