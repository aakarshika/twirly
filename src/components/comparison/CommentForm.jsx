import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
// eslint-disable-next-line react/default-props-match-prop-types
import { MentionsInput, Mention } from 'react-mentions';
import { supabase } from '../../lib/supabase';
import { getPublicUrl } from '../../lib/utils';

const CommentForm = ({ newComment, setNewComment, handleSubmitComment, users, items, userPreferences, type }) => {
  const inputRef = useRef(null);
  const [focus, setFocus] = useState(false);

  
  const itemsToDisplay = items?.map(item => {
    return {
      id: item.items.id,
      display: item.items.name,
      description: item.items.description
    };
  }) || [];
  

  const mentionStyles = {
    control: {
      backgroundColor: 'white',
      fontSize: 12,
      fontWeight: 'normal',
    },
    input: {
      fontSize: 16,
      margin: 0,
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
        textAlign: 'left',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      item: {
        padding: '6px 8px',
        '&focused': {
          backgroundColor: '#f3f4f6',
        },
      },
    },
  };

  const renderSuggestionItems = (suggestion, search, highlightedDisplay) => {
    console.log('Rendering suggestion:', suggestion);
    return (
      <div className="flex flex-col items-start">
        <span className="font-medium">{highlightedDisplay}</span>
        <span className="text-gray-500 text-sm">#{suggestion.description}</span>
      </div>
    );
  };

  const renderSuggestionUsers = (suggestion, search, highlightedDisplay) => (
    <div className="flex flex-col items-start">
      <span className="font-medium">{highlightedDisplay}</span>
      <span className="text-gray-500 text-sm">@{suggestion.username}</span>
    </div>
  );

  return (
    <div className="flex">
      {type == 'Reply' && (<div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{marginTop: '2px', background: 'lightgray'}}></div>)}
      <div className="w-full p-2 bg-white">
        <>
          <div className="flex">
            <img
              src={getPublicUrl(userPreferences?.profile_image_url)}
              alt={userPreferences?.username || 'User'}
              className="w-6 h-6 rounded-full mr-2"
            />

            <div className="flex flex-col w-full">
              <span className="font-bold text-start text-md">{userPreferences?.username || 'Anonymous'}</span>
              <div className="w-full" style={{border: '1px solid #e2e8f0'}}>
                <div className="flex flex-col w-full">
                  <MentionsInput
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={mentionStyles}
                    placeholder={focus ? `${type} @user #product` : `Add ${type}...`}
                    className="w-full min-h-8 h-auto"
                    inputRef={inputRef}
                    onFocus={(e) => {
                      setFocus(true);
                    }}
                  >
                    <Mention
                      trigger="@"
                      data={users}
                      renderSuggestion={renderSuggestionUsers}
                      className="bg-amber-100 text-amber-800 px-1"
                      appendSpaceOnAdd={true}
                      markup="@[__display__](__id__)"
                      displayTransform={(id, display) => ` @${display} `}
                    />
                    <Mention
                      trigger="#"
                      data={itemsToDisplay}
                      renderSuggestion={renderSuggestionItems}
                      className="bg-blue-100 text-blue-800 px-1"
                      appendSpaceOnAdd={true}
                      markup="#[__display__](__id__)"
                      displayTransform={(id, display) => ` #${display} `}
                    />
                  </MentionsInput>
                  {newComment.length > 0 && (
                    <div className="flex justify-start">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
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
