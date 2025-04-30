import React, { useState, useRef } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import './Reply.css';
import { getPublicUrl } from '../../lib/utils';
import useMentionInput from '../../hooks/useMentionInput';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Reply = ({ reply, onLike, onReply, appendText, products }) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const users = [{ items: {name: "John Doe", id: 1}}, { items: {name: "Jane Doe", id: 2}}, { items: {name: "John_Smith", id: 3}}, { items: {name: "Jane_Smith", id: 4}}];

  const {
    suggestions,
    contentEditableRef,
    handleInputChange,
    insertMention,
    text,
    handleReplySubmit
  } = useMentionInput(users, products);

  React.useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const { data: profile, error: profileError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        setUserPreferences(profile);
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  const renderTextWithMentions = (text) => {
    if (!text) return null;
    
    const parts = text.split(/(\w+)/);
    
    let startCodeIndex = -1;
    let userName = " ";
    let nameEndIndex = -1;
    const a = parts.map((part, index) => {
      if (part == ' @['){
        startCodeIndex = index;
        userName = " ";
        nameEndIndex = -1;
        return null;
      }
      if (startCodeIndex == -1) return part;

      if (startCodeIndex+1 <= index && part != "](" ){
        userName = userName+ part;
      }
      else if(part == "]("){
        const ss = userName + " ";
        nameEndIndex = index;
        return (
          <span key={index} >
            <span className="bg-amber-100 text-amber-800 rounded px-1">
              {ss}
            </span>
          </span>
        )
      }
      if (nameEndIndex+1 <= index && index <= startCodeIndex+9){
        return null;
      }
      if (nameEndIndex+10 == index){
        startCodeIndex = -1;
        return null;
      }
      return;
    });
  
    return a;
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
          <p style={{ textAlign: 'start' }}>{renderTextWithMentions(reply.text)}</p>
        </div>

        <div className="ml-8 flex items-center gap-3 mb-1">
          <button onClick={() => onLike(reply.id)} className={`flex items-center gap-1 text-xs ${reply.userReaction === 'like' ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
            <Heart className={`w-3.5 h-3.5 ${reply.userReaction === 'like' ? 'fill-current' : ''}`} />
            {reply.reactions?.length || 0}
          </button>
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-400"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Reply
          </button>
        </div>

        {isReplying && (
          <form onSubmit={(e) => {
            onReply(reply.id, text);
            setIsReplying(false);
            handleReplySubmit(e);
          }} className="mt-1">
            <div className="flex">
              <div className="w-1 h-auto bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '2px', background: 'lightgray' }}></div>
              <div className="p-1 w-full border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start mb-1">
                  <img
                    src={getPublicUrl(userPreferences?.profile_image_url)}
                    alt={userPreferences?.display_name || 'User'} 
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <div className="flex flex justify-start">
                    <span className="font-bold text-sm">{userPreferences?.display_name || 'User'}</span>
                    <span><div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 ml-2 mr-2" style={{ marginTop: '8px', background: 'lightgray' }}></div></span>
                    <span className="font-normal text-xs text-gray-400 dark:text-gray-300" style={{ marginTop: '2px' }}>
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-gray-700 dark:text-gray-300 ml-8 text-start">
                  <div
                    ref={contentEditableRef}
                    contentEditable
                    onInput={(e) => handleInputChange(e.target.innerText)}
                    placeholder="Write a reply..."
                    className="w-full p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    style={{ minHeight: '32px', outline: 'none' }}
                  />
                  {suggestions?.length > 0 && (
                    <ul className="suggestions-list">
                      {suggestions.map((item) => (
                        <li key={item.items.id+'-'+reply.id} onClick={() => insertMention(item)}>
                          {item.items.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button type="submit" className="mt-1 px-2 py-0.5 bg-amber-400 text-black rounded text-xs font-medium hover:bg-amber-300 transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Reply;
