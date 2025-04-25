import React from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ItemGallery from '../components/items/ItemGallery';
import ItemDetails from '../components/items/ItemDetails';
import ItemPolls from '../components/items/ItemPolls';
import ItemMetrics from '../components/items/ItemMetrics';
import ItemComments from '../components/items/ItemComments';
import SimilarItems from '../components/items/SimilarItems';
import ItemActions from '../components/items/ItemActions';

const ItemPage = () => {
  const { itemId } = useParams();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="space-y-6">
            <ItemGallery itemId={itemId} />
            <ItemDetails itemId={itemId} />
            <ItemActions itemId={itemId} />
            <ItemPolls itemId={itemId} />
            <ItemMetrics itemId={itemId} />
            <ItemComments itemId={itemId} />
            <SimilarItems itemId={itemId} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <ItemGallery itemId={itemId} />
          </div>
          <div className="md:col-span-7">
            <div className="space-y-8">
              <ItemDetails itemId={itemId} />
              <ItemActions itemId={itemId} />
              <ItemPolls itemId={itemId} />
              <ItemMetrics itemId={itemId} />
              <ItemComments itemId={itemId} />
              <SimilarItems itemId={itemId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemPage; 