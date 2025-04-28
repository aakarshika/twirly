import { useState, useRef } from 'react';
import { useEffect } from 'react';

const useMentionInput = (users, products) => {
  const [text, setText] = useState('Lol');
  const [textToSave, setTextToSave] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mode, setMode] = useState('normal');
  const contentEditableRef = useRef(null);
  const [triggerPosition, setTriggerPosition] = useState(-1);
  
  const renderTextWithMentions = (text) => {
    const words = text.split(' ');
    const processedText = words.map(word => {
      if (word.startsWith('@') && word.length > 1) {
        console.log('word', word);
        const matchSplit = word.split(/(@\(user\(([A-Za-z0-9_#]+)\)\[([0-9]+)\]\))+/g);
        console.log('matchSplit', matchSplit);
        const userName = unescapeMentionName(matchSplit[2]);
  
        return `<span class="highlighted-mention-user">${word}</span>`;
      } else if (word.startsWith('#')) {
        return `<span class="highlighted-mention-product">${word}</span>`;
      } else {
        return `<span class="normal-text">${word}</span>`;
      }
    });
    return processedText.join(' ');
  };

const handleReplySubmit = (e) => {
  e.preventDefault();
  if (!text.trim()) return;

  setText('');
};
  useEffect(() => {
    if (contentEditableRef.current) {
      const renderHtml = renderTextWithMentions(text);
      contentEditableRef.current.innerHTML = renderHtml ;
      moveCursorToEnd();
    }
  }, [text]);
  useEffect(() => {
    if (contentEditableRef.current) {
      console.log("rendered:", contentEditableRef.current.innerHTML);
      console.log("innerText:", contentEditableRef.current.innerText);
      console.log("triggerPosition:", triggerPosition);
    }
  }, [text]);
  const moveCursorToEnd = () => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(contentEditableRef.current);
    range.collapse(false); // Move to end
    selection?.removeAllRanges();
    selection?.addRange(range);
  }


  const handleInputChange = (innerText) => {
    const value = innerText;
    setText(value);
    setTriggerPosition(value.length - 1);


    const lastChar = value.slice(-1);
    if (lastChar === '@') {
      setMode('mentionUser');
      setSuggestions(users);
    } else if (lastChar === '#') {
      setMode('mentionProduct');
      setSuggestions(products);
    } else {
      setMode('normal');
      setSuggestions([]);
    }
  };

  const appendText = (textToAppend) => {
    handleInputChange(text + textToAppend);
  };
  const escapeMentionName = (name) => {
    return name
      .replaceAll(/ /g, '#space#');
  }
  const unescapeMentionName = (name) => {
    return name && name.length > 0 ? name
      .replaceAll(/#space#/g, ' ') : '';
  }
  
  const insertMention = (mention) => {
    const aa = escapeMentionName(mention.items.name);
    console.log('insertMention escaped', aa);
    const mentionText = mode === 'mentionUser' ? `@(user(${aa})[${mention.items.id}]) ` : `#(product(${aa})[${mention.items.id}]) `;

    if (triggerPosition !== -1) {
      const newText = text.substring(0, triggerPosition) + mentionText + text.substring(triggerPosition + 1);
      handleInputChange(newText);
    }

    setSuggestions([]);
    setTriggerPosition(-1);
  };

  return {
    suggestions,
    mode,
    text,
    contentEditableRef,
    handleInputChange,
    // handleTyping,
    handleReplySubmit,
    insertMention,
    appendText
  };
};

export default useMentionInput;
