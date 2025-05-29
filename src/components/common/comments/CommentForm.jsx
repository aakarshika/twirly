import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { MentionsInput, Mention } from 'react-mentions';
import Avatar from '../Avatar';
import { getPublicUrl } from '../../../lib/utils';
import './Comment.css';
import { useTheme } from '../../../contexts/ThemeContext';

const CommentForm = ({ newComment, setNewComment, handleSubmitComment, users, items, userPreferences, type }) => {
  const inputRef = useRef(null);
  const [focus, setFocus] = useState(false);
  const { currentTheme } = useTheme();
  
  const itemsToDisplay = items?.map(item => {
    // Handle both nested and flat item structures
    const itemData = item.items || item;
    return {
      id: itemData.id,
      display: itemData.name,
      description: itemData.description
    };
  }) || [];
  const display_name_clipped = userPreferences?.display_name ? userPreferences?.display_name.slice(0, 25) : 'Anonymous';
  const mentionStyles = {
    input: {
      fontSize: '16px',
      color: 'black',
      minHeight: '35px',
      outline: 'none',
      border: `none`,
      paddingLeft: '5px'
    },
    suggestions: {
      list: {
        backgroundColor: '#fff',
        border: '1px solid rgba(0,0,0,0.15)',
        fontSize: 14,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: '6px'
      },
      item: {
        padding: '8px 12px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        '&focused': {
          backgroundColor: '#f3f4f6',
        },
      },
    }
  };

  const renderSuggestionItems = (suggestion, search, highlightedDisplay) => (
    <div className="flex flex-col items-start">
      <span className="font-medium">#{highlightedDisplay}</span>
    </div>
  );

  const renderSuggestionUsers = (suggestion, search, highlightedDisplay) => (
    <div className="flex flex-col items-start">
      <span className="font-medium">@{highlightedDisplay}</span>
    </div>
  );

  return (
    <div className="flex w-full">
      {type === 'Reply' && (
        <div className="w-1 h-auto mr-2" style={{background: 'lightgray'}} />
      )}
      <div className="flex-1 rounded-lg">
        <div className="flex items-start gap-3">
        <div style={{scale: '0.9'}}>
          <Avatar
            profileImageUrl={getPublicUrl(userPreferences?.profile_image_url)}
            displayName={display_name_clipped}
            size="sm"
          />
          </div>
          <div className="flex-1">
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm text-left" style={{color: currentTheme.colors.text}}>
                {display_name_clipped || 'Anonymous'}
              </span>
            </div>
            <div className="w-full rounded-md border border-gray-200 focus-within:border-amber-400 transition-colors" style={{color: 'black'}}>
              <MentionsInput
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={mentionStyles}
                placeholder={focus ? `Type # to tag items` : `Add ${type}...`}
                className="min-h-8 h-auto w-full"
                inputRef={inputRef}
                onFocus={() => setFocus(true)}
              >
                <Mention
                  trigger="@"
                  data={users}
                  renderSuggestion={renderSuggestionUsers}
                  appendSpaceOnAdd={true}
                  className="mention-user"
                  markup="@[__display__](__id__)"
                  displayTransform={(id, display) => ` @${display} `}
                />
                <Mention
                  trigger="#"
                  data={itemsToDisplay}
                  renderSuggestion={renderSuggestionItems}
                  appendSpaceOnAdd={true}
                  markup="#[__display__](__id__)"
                  className="mention"
                  style={{backgroundColor: 'lightgray'}}
                  displayTransform={(id, display) => ` #${display} `}
                />
              </MentionsInput>
            {newComment.length > 0 && (
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmitComment();
                  }}
                  className="mr-1 mb-1 px-2 py-1 bg-amber-400 rounded-md text-black font-medium hover:bg-amber-300 transition-colors text-sm"
                >
                  {type}
                </button>
                <button
                  onClick={() => setNewComment('')}
                  className="mr-1 mb-1 px-2 py-1 bg-gray-100 rounded-md text-gray-700 font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
