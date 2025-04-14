import React from 'react';
import { Heart } from 'lucide-react';
import './Reply.css';
const Reply = ({ reply }) => {
  // Function to render text with highlighted mentions
  const renderTextWithMentions = (text) => {
    
    text = text.trim();
    // replace multiple spaces with a single space
    text = text.replace(/\n+/g, ' <br> ');
    text = text.replace(/\s+/g, ' ');
    text = text+' ';
    const words = text.split(' '); // Split the text into words
    return words.map((word, index) => {
      const key = `${word}-${index}`; // Create a unique key using the word and index
      if (word === '<br>') {
        return <br key={key} />;
      } else if (word.length > 1 && word.startsWith('@')) {
        return (
          <span key={key}>
            <span className="highlighted-mention-user">
              {word}
            </span>
          </span>
        );
      } else if (word.length > 1 && word.startsWith('#')) {
        return (
          <span key={key}>
            <span className="highlighted-mention-product">
              {word}
            </span>
          </span>
        );
      }
      return <span key={key}>{' ' + word}</span>; // Add space back for normal words
    });
  };

  return (
    <div className="flex">    
      <div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{marginTop: '2px', background: 'lightgray'}}></div>
      <div className="p-2 w-full border-b border-gray-200 dark:border-gray-700">
        {/* space and vertical line in the beginning of the reply */}
        <div className="flex items-start">
          <img
            src={reply.user?.profile_picture || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'}
            alt={reply.user?.username || 'User'}
            className="w-6 h-6 rounded-full mr-2"
          />
          <div className="flex flex justify-start">
            <span className="font-bold  text-md">{reply.user?.username || 'Anonymous'}</span>
            <span><div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{marginTop: '10px', background: 'lightgray'}}></div></span>
            <span className="font-normal text-sm text-gray-400 dark:text-gray-300" style={{marginTop: '2px'}}>
              {new Date(reply.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="text-gray-700 dark:text-gray-300 ml-8">
          {renderTextWithMentions(reply.text)} {/* Render the text with mentions */}
        </div>

        <div className="ml-8 flex items-center gap-4 mb-3">
          <button className={`flex items-center gap-1 text-sm ${reply.userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
            <Heart className={`w-4 h-4 ${reply.userReaction === 'like' ? 'fill-current' : ''}`} />
            {reply.reactions?.length || 0}
          </button>
        </div>
      </div>
    </div>

  );
};

export default Reply;
