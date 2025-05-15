import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { MentionsInput, Mention } from 'react-mentions';
import Avatar from '../Avatar';
import { getPublicUrl } from '../../../lib/utils';
import './Comment.css';
import { color } from 'framer-motion';
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
    input: {
      color: 'black',
      minHeight: '35px',
      outline: 'none',
      width: '100%',
      borderRadius: '6px 6px 0 6px',
      border: `none`
    },
    mentionUser: {
      backgroundColor: 'rgba(255, 217, 0, 0.28)',
      border: '1px solid rgba(255, 215, 0, 0.85)',
      borderRadius: '6px'
    },
    mentionItem: {
      backgroundColor: 'rgba(53, 160, 37, 0.78)',
      border: '1px solid rgba(14, 203, 74, 0.85)',
      borderRadius: '6px'
    },
    suggestions: {
      list: {
        backgroundColor: '#555',
        border: '1px solid rgba(0,0,0,0.15)',
        fontSize: 14,
      },
      item: {
        padding: '5px 15px',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        '&focused': {
          backgroundColor: '#cee4e5',
        },
      },
    }
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
      <span className="text-gray-500 text-sm">@{suggestion.display_name}</span>
    </div>
  );

  return (
    <div className="flex">
      {type == 'Reply' && (<div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{marginTop: '2px', background: 'lightgray'}}></div>)}
      <div className="w-full p-2 bg-white">
        <>
          <div className="flex">
            <Avatar
              profileImageUrl={getPublicUrl(userPreferences?.profile_image_url)}
              displayName={userPreferences?.display_name}
              size="sm"
              className="mr-2"
            />
            <div className="flex flex-col w-full">
              <span className="font-bold text-start text-md">{userPreferences?.display_name || 'Anonymous'}</span>
              <div className="w-full rounded-md" style={{border: '1px solid #e2e8f0'}}>
                <div className="flex flex-col w-full p-2">
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
                      appendSpaceOnAdd={true}
                      style={mentionStyles.mentionUser}
                      markup="@[__display__](__id__)"
                      displayTransform={(id, display) => ` @${display} `}
                    />
                    <Mention
                      trigger="#"
                      data={itemsToDisplay}
                      renderSuggestion={renderSuggestionItems}
                      appendSpaceOnAdd={true}
                      markup="#[__display__](__id__)"
                      style={{
                        backgroundColor: 'rgba(0, 49, 104, 0.17)',
                        border: '1px solid rgba(0, 49, 104, 0.85)',
                        borderRadius: '6px'
                      }}
                      displayTransform={(id, display) => ` #${display} `}
                    />
                  </MentionsInput>
                  {newComment.length > 0 && (
                    <div className=" p-2 flex justify-end gap-2">
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
                        className="w-auto mt-1 px-3 py-1.5 justify-start bg-white-400 rounded-md text-black font-small hover:bg-gray-300 transition-colors flex items-start gap-1.5 text-sm"
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
