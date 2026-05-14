import React from 'react';

const ProductHeader = ({ item }) => {

  if (!item) return null;

  return (
    <div className="flex flex-col items-center">
      <div style={{ margin: '20px' }}>
        <h1 className="text-2xl font-bold">{item.name}</h1>
      </div>
      <div>
      </div>
    </div>
  );
};

export default ProductHeader;
