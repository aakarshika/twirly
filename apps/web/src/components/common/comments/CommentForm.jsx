import React, { useRef, useState } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import Avatar from '@components/common/Avatar';
import { getPublicUrl } from '@utils/utils';
import './Comment.css';

const CommentForm = ({ newComment, setNewComment, handleSubmitComment, users, items, userPreferences, type }) => {
  const inputRef = useRef(null);
  const [focus, setFocus] = useState(false);
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  const itemsToDisplay = (items || []).map(item => {
    const d = item.items || item;
    return { id: d.id, display: d.name, description: d.description };
  });

  const displayNameClipped = userPreferences?.display_name
    ? userPreferences.display_name.slice(0, 25).toLowerCase()
    : 'anonymous';

  const mentionStyles = {
    input: {
      fontSize: 15,
      fontFamily: '"Fraunces", serif',
      color: t.ink,
      minHeight: 35,
      outline: 'none',
      border: 'none',
      paddingLeft: 5,
      background: 'transparent',
    },
    suggestions: {
      list: {
        backgroundColor: t.bg,
        border: `1px solid ${t.ink}26`,
        fontSize: 13,
        fontFamily: '"Fraunces", serif',
        borderRadius: 4,
        boxShadow: `0 4px 12px ${t.ink}14`,
      },
      item: {
        padding: '8px 12px',
        borderBottom: `1px solid ${t.ink}0f`,
        color: t.ink,
        '&focused': { backgroundColor: t.bgDeep },
      },
    },
  };

  return (
    <div className="flex w-full">
      {type === 'Reply' && (
        <div className="w-px mr-3 self-stretch" style={{ background: `${t.ink}20` }} />
      )}
      <div className="flex-1">
        <div className="flex items-start gap-2.5">
          <Avatar
            profileImageUrl={getPublicUrl(userPreferences?.profile_image_url)}
            displayName={displayNameClipped}
            size="xs"
          />
          <div className="flex-1">
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: t.ink, opacity: 0.55, marginBottom: 4 }}>
              {displayNameClipped}
            </p>
            <div
              className="w-full rounded-sm"
              style={{ border: `1px solid ${focus ? t.mustard : t.ink}26`, transition: 'border-color 0.15s' }}
            >
              <MentionsInput
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                style={mentionStyles}
                placeholder={focus ? 'Type # to tag items' : `Add ${type}...`}
                className="min-h-8 h-auto w-full"
                inputRef={inputRef}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
              >
                <Mention
                  trigger="@"
                  data={users}
                  renderSuggestion={(_, __, highlightedDisplay) => (
                    <span className="font-medium">@{highlightedDisplay}</span>
                  )}
                  appendSpaceOnAdd
                  className="mention-user"
                  markup="@[__display__](__id__)"
                  displayTransform={(_, display) => ` @${display} `}
                />
                <Mention
                  trigger="#"
                  data={itemsToDisplay}
                  renderSuggestion={(_, __, highlightedDisplay) => (
                    <span className="font-medium">#{highlightedDisplay}</span>
                  )}
                  appendSpaceOnAdd
                  markup="#[__display__](__id__)"
                  className="mention"
                  style={{ backgroundColor: `${t.mustard}40` }}
                  displayTransform={(_, display) => ` #${display} `}
                />
              </MentionsInput>

              {newComment.length > 0 && (
                <div className="flex justify-end gap-2 p-2">
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleSubmitComment(); }}
                    className="px-3 py-1 rounded-sm text-sm transition-opacity hover:opacity-80"
                    style={{
                      background: t.red,
                      color: t.bg,
                      fontFamily: '"DM Serif Display", serif',
                      fontStyle: 'italic',
                      fontSize: 13,
                    }}
                  >
                    {type}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewComment('')}
                    className="px-3 py-1 rounded-sm text-sm transition-opacity hover:opacity-80"
                    style={{
                      background: t.bgDeep,
                      color: `${t.ink}80`,
                      fontFamily: '"Fraunces", serif',
                      fontSize: 13,
                    }}
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
