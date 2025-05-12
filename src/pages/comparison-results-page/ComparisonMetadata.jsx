import React from 'react';
import { User, Clock, MessageCircle, ThumbsUp, Target, ThumbsUpIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ComparisonMetadata = ({ comparison, isMobile }) => {
  const containerClasses = isMobile 
    ? 'absolute top-0  z-0  w-full justify-center px-4 mb-6 mt-10 ' 
    : 'absolute top-0  z-0 w-full justify-center  mb-8 mt-10';

  return (
    <div className='flex flex-col w-full h-full'>
      <div  className='relative z-0'>
    <div className={containerClasses}>
      <div className="rounded-lg shadow-sm p-4">
        <div className="flex flex-col space-y-3">
          {/* Timestamps */}
          <div className="flex justify-end space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Started {formatDistanceToNow(new Date(comparison.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Engagement Stats */}
          <div className="flex justify-end space-x-4">
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{comparison.total_comments || 0} comments</span>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="flex justify-end space-x-4">
            <div className="flex items-center space-x-1">
              <ThumbsUpIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{comparison.total_votes || 0} votes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    <div className='relative'>
      <div className='flex flex-row justify-start items-center z-10' >
        <h4 className='text-lg font-bold p-4' style={{color: 'black'}}>
          {/* {comparison.name} */}
           The votes are in!
          </h4>
      </div>
    </div>
    </div>
  );
};

export default ComparisonMetadata; 