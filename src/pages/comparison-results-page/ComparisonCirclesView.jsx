import React from 'react';
import ComparisonCircle from './ComparisonCircle';
import {
    findWinner,
    hasAnyClearLeader,
    calculateProcessedItems
  } from '../../services/comparisonService';
import ComparisonMetadata from './ComparisonMetadata';
import Avatar from '../../components/common/Avatar';
import { getPublicUrl } from '../../lib/utils';

const List = ({displayItems, isMobile, winner, comparison}) => {
    return <>
    {displayItems.map((item, index) => (
        <ComparisonCircle
            key={item.id}
            item={item}
            index={index}
            isMobile={isMobile}
            winner={winner}
            comparison={comparison}
        />
    ))}
    </>
};

const ComparisonCirclesView = ({ items, comparisonMetrics, comparison }) => {
    // Ensure we have between 2 and 4 items
    const displayItems = calculateProcessedItems(
        items,
        comparisonMetrics
    );
    
    console.log(comparison);
    // Find the winner from the processed items
    const winner = findWinner(displayItems);

    return (
        <div className="">
            <div className="max-w-7xl mx-auto">
                {/* Metadata Section */}
                <ComparisonMetadata comparison={comparison} isMobile={false} />
                
                {/* Mobile Layout */}
                <div className="relative sm:hidden">
                    <List displayItems={displayItems} isMobile={true} winner={winner} comparison={comparison} />
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 relative p-4">
                    <List displayItems={displayItems} isMobile={false} winner={winner} comparison={comparison} />
                </div>

          {/* Creator Info */}
          <div className="flex justify-start m-4 mb-0 space-x-2">
            <Avatar 
          profileImageUrl={comparison.user?.profile_image_url ? getPublicUrl(comparison.user?.profile_image_url) : null}
          displayName = {comparison.user?.display_name}
            username = {comparison.user?.username}
            size = 'sm'
            isEditable = {false}
            />
            <span className="text-lg text-gray-600">
              Created by {comparison.user?.display_name || 'Anonymous'}
            </span>
          </div>
          <div className='flex flex-row justify-start items-center z-10' >
            <h4 className='text-md p-4' style={{color: 'black'}}>{comparison.name}</h4>
            </div>
          </div>
        </div>
    );
};

export default ComparisonCirclesView; 