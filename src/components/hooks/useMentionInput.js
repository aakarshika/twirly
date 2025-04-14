import { useState, useRef } from 'react';

const useMentionInput = (users, products) => {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mode, setMode] = useState('normal');
  const [triggerPosition, setTriggerPosition] = useState(-1);
  const contentEditableRef = useRef(null);

  const handleInputChange = (innerText) => {
    const value = innerText;

    console.log('handleInputChange- contentEditableRef.current.innerText', contentEditableRef.current.innerText);
    console.log('handleInputChange- e.target.innerText', innerText);
    setText(value);

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const left = rect.left + window.scrollX;
    }

    const lastChar = value.slice(-1);
    if (lastChar === '@') {
      setMode('mentionUser');
      setSuggestions(users);
      setTriggerPosition(value.length - 1);
    } else if (lastChar === '#') {
      setMode('mentionProduct');
      setSuggestions(products);
      setTriggerPosition(value.length - 1);
    } else {
      setMode('normal');
      setSuggestions([]);
    }
  };

  const insertMention = (mention) => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const mentionText = mode === 'mentionUser' ? `@${mention} ` : `#${mention} `;
    const text = contentEditableRef.current.innerText;

    if (triggerPosition !== -1) {
      const newText = text.substring(0, triggerPosition) + mentionText + text.substring(triggerPosition + 1);
      contentEditableRef.current.innerText = newText+' ';
      console.log('newText', newText);
      console.log('contentEditableRef.current.innerText', contentEditableRef.current.innerText);

      const newCursorPos = triggerPosition + mentionText.length;
      const newRange = document.createRange();
      const textNode = contentEditableRef.current.firstChild || contentEditableRef.current;
      const safeCursorPos = Math.min(newCursorPos, textNode.length);

      newRange.setStart(textNode, safeCursorPos);
      newRange.setEnd(textNode, safeCursorPos);
      selection.removeAllRanges();
      selection.addRange(newRange);
      handleInputChange(newText);
    }

    setSuggestions([]);
    setTriggerPosition(-1);
    if (contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  };

  return {
    text,
    setText,
    suggestions,
    mode,
    contentEditableRef,
    handleInputChange,
    insertMention,
  };
};

export default useMentionInput;
