import React from 'react';
import ImageGallery from './ImageGallery';
import ItemInfo from './ItemInfo';
import PriceInfo from './PriceInfo';

const ItemHeader = ({ item }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ImageGallery images={item.images || []} />
      <div className="flex flex-col justify-between">
        <ItemInfo item={item} />
        <PriceInfo item={item} />
      </div>
    </div>
  );
};

export default ItemHeader; 