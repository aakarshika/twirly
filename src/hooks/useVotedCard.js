import { useEffect, useRef } from 'react';
import { getPublicUrlItems } from '../lib/utils';

export const useVotedCard = ({
  item,
  handleRevertClick,
  handleItemClick,
  totalVotes,
  itemReviewData,
  reviewCount,
  isVotedItem
}) => {
  const titleRef = useRef(null);
  const itemImage = item.image_url && item.image_url.startsWith('https://') ? item.image_url : getPublicUrlItems(item.image_url);

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

  //detect and convert hex to rgb:
  const isHexColor = /^(#|0x)[0-9A-Fa-f]+$/.test(item.item_color_string);
  //convert hex to rgb(r,g,b) where r,g,b are numbers between 0 and 255
  const color = isHexColor ? `rgb(${parseInt(item.item_color_string.slice(1, 3), 16)}, ${parseInt(item.item_color_string.slice(3, 5), 16)}, ${parseInt(item.item_color_string.slice(5, 7), 16)})` : item.item_color_string;

  return {
    titleRef,
    itemImage,
    color
  };
}; 