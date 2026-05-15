import React from 'react';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import CommentHeader from './CommentHeader';

const Reply = ({ reply, onLike, onReply, _appendText, items }) => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  return (
    <div className="flex">
      <div
        className="mr-3 self-stretch flex-shrink-0"
        style={{ width: 1, background: `${t.ink}18` }}
      />
      <div className="w-full">
        <CommentHeader
          type="LastReply"
          comment={reply}
          onLike={onLike}
          replyClicked={() => onReply(reply)}
          profile_image_url={reply.user?.profile_image_url}
          display_name={reply.user?.display_name}
          created_at={reply.created_at}
          text={reply.text}
          userReaction={reply.userReaction}
          reactions={reply.reactions}
          objectId={reply.id}
          numReplies={reply.replies?.length}
          items={items}
        />
      </div>
    </div>
  );
};

export default Reply;
