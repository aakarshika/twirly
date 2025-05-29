import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import VotedCard from '../comparison-aspect-page/ComparisonItemCard/VotedCard';

const ProductHeader = ({ item }) => {
  const { currentTheme } = useTheme();

  if (!item) return null;

  return (
    <div className="flex flex-col items-center">
      <div style={{ margin: '20px' }}>
        <h1 className='text-2xl font-bold'>{item.name}</h1>
      </div>
      <div>
      </div>
    </div>
  );
};

export default ProductHeader; 