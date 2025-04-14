import React from 'react';
import Description from './Description';
import Specifications from './Specifications';

const ItemDetails = ({ item }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <Description description={item.description} />
      <Specifications specifications={item.specifications} />
    </div>
  );
};

export default ItemDetails; 