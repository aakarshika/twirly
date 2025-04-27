import React from 'react';
import { Heart } from 'lucide-react';
import './Reply.css';
import { getPublicUrl } from '../../lib/utils';

const Reply = ({ reply, onLike, onReply, contentEditableRef, appendText }) => {

  const unescapeMentionName = (name) => {
    return name
      .replaceAll(/#space#/g, ' ');
  }
  
  // Function to render text with highlighted mentions
  const renderMentionText = (text) => {
    // Split the text based on the mention pattern: @(user(...)[id])
    const mentionPattern = /(@\(user\(([A-Za-z0-9_#]+)\)+\[([0-9]+)\]\))+/g;
    
    // Split the text into regular parts and mentions
    const parts = text.split(mentionPattern);
  
    var a = null;

    // Render the text
    var i = 3;
    var matchStarted = false;
    a = parts.map((part, index) => {
      const matches = part.match(/(@\(user\(([A-Za-z0-9_#]+)\)\[([0-9]+)\]\))+/g);
      if (matchStarted){
        i ++;
        if (i <= 2){
          return ;
        }
      }
      if (matches) {
        i = 0;
        matchStarted = true;  
        const matchSplit = part.split(/(@\(user\(([A-Za-z0-9_#]+)\)\[([0-9]+)\]\))+/g);
        const userName = matchSplit[2];
        const userId = matchSplit[3];
  
        // Render mention as a clickable span or any other element
        return(
          <span key={index} className="highlighted-mention-user" onClick={() => handleMentionClick(userId)}>
            @{unescapeMentionName(userName)}
          </span>
        );
      } else {
        // This is regular text, just render it normally
        return (<span key={index}>{part}</span>);
      }
    });
    return a;
  };
  
  
  const handleMentionClick = (userId) => {
    // Handle the mention click (e.g., show user profile or navigate)
    console.log("Mention clicked, userId:", userId);
  };
  
  

  const handleReplyClick = () => {
    if (appendText && reply.user?.username) {
      appendText(`@${reply.user.username} `);
    }
  };

  return (
    <div className="flex">    
      <div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{marginTop: '2px', background: 'lightgray'}}></div>
      <div className="p-1 w-full border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start">
          <img
            src={getPublicUrl(reply.user?.profile_image_url)}
            alt={reply.user?.username || 'User'}
            className="w-6 h-6 rounded-full mr-2"
          />
          <div className="flex flex justify-start">
            <span className="font-bold text-sm">{reply.user?.display_name || 'Anonymous'}</span>
            <span><div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{marginTop: '8px', background: 'lightgray'}}></div></span>
            <span className="font-normal text-xs text-gray-400 dark:text-gray-300" style={{marginTop: '2px'}}>
              {new Date(reply.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="text-gray-700 dark:text-gray-300 ml-8 text-sm">
          <p style={{ textAlign: 'start' }}>{renderMentionText(reply.text)}</p>
        </div>

        <div className="ml-8 flex items-center gap-3 mb-1">
          <button onClick={() => onLike(reply.id)} className={`flex items-center gap-1 text-xs ${reply.userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
            <Heart className={`w-3.5 h-3.5 ${reply.userReaction === 'like' ? 'fill-current' : ''}`} />
            {reply.reactions?.length || 0}
          </button>
          <button 
            onClick={handleReplyClick}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-400"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reply;
