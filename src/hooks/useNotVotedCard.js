import { useEffect, useRef } from 'react';
import { getPublicUrlItems } from '../lib/utils';

export const useNotVotedCard = ({
  item,
  handleItemClick
}) => {
  const titleRef = useRef(null);
  const itemImage = item.image_url && item.image_url.startsWith('http') ? item.image_url : getPublicUrlItems(item.image_url);

  useEffect(() => {
    if (titleRef.current) {
      const titleElement = titleRef.current;
      const wordCount = item.name.trim().split(/\s+/).length;
      
      if (wordCount > 10) {
        titleElement.style.fontSize = '0.875rem';
      } else {
        titleElement.style.fontSize = '1.5rem';
      }
    }
  }, [item.name]);

  return {
    titleRef,
    itemImage
  };
}; 