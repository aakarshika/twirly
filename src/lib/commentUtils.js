
// Regular expression to match mentions in the format @[Display Name](user_id)
const MENTION_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;
const PRODUCT_REGEX = /#\[([^\]]+)\]\(([^)]+)\)/g;

export const parseMentions = (text) => {
  if (!text) return [];
  
  const mentions = [];
  let match;
  
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    mentions.push({
      display: match[1],
      id: match[2],
      index: match.index,
      length: match[0].length,
      type: 'user'
    });
  }
  
  while ((match = PRODUCT_REGEX.exec(text)) !== null) {
    mentions.push({
      display: match[1],
      id: match[2],
      index: match.index,
      length: match[0].length,
      type: 'product'
    });
  }
  
  return mentions.sort((a, b) => a.index - b.index);
};

export const renderTextWithMentions = (text, itemColorCoding) => {
  if (!text) return null;
  const mentions = parseMentions(text);
  if (mentions.length === 0) return text;
  
  const parts = [];
  let lastIndex = 0;
  
  mentions.forEach((mention) => {
    // Add text before the mention
    if (mention.index > lastIndex) {
      parts.push(text.slice(lastIndex, mention.index));
    }
    const color = itemColorCoding?.find(item => parseInt(item.id) === parseInt(mention.id))?.item_color_string || '#000000';
    
    // Add the mention with appropriate styling
    const mentionElement = mention.type === 'user' 
      ? 
      `<a href="/user/${mention.display.trim()}"
        <span class="text-amber-800">@${mention.display.trim()}</span>
      </a>`
      : `<a href="/item/${mention.id}"
          <span class="text-blue-800 pl-1 mr-1 rounded"   
            style="background-color: ${color}; padding-bottom: 2px; color: white;">
            #${(mention.display).trim()}
          </span>
        </a>`;
    
    parts.push(mentionElement);
    lastIndex = mention.index + mention.length;
  });
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.join('');
};
