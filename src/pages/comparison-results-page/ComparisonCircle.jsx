import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Image, ThumbsUp, Target, User, Clock, MessageCircle, ThumbsUp as ThumbsUpIcon } from 'lucide-react';
import { splitAndJoin } from '../../lib/utils';
import { hasAnyClearLeader } from '../../services/comparisonService';
import { formatDistanceToNow } from 'date-fns';


const ComparisonCircle = ({ item, index, isMobile = false, winner, comparison }) => {
  const circleClasses = isMobile
    ? {
        container: `relative ${index % 2 === 0 ? 'ml-0 mr-auto' : 'ml-auto mr-0'} ${index > 0 ? '-mt-24' : ''}`,
        style: { width: '80%', maxWidth: '250px' },
        circle: 'relative w-full pb-[100%]',
        innerCircle: 'absolute inset-0 rounded-lg bg-white shadow-xl p-5 flex flex-col items-center border-4 border-gray-200 overflow-hidden',
        imageContainer: 'w-full h-20 relative',
        title: 'text-lg font-bold text-gray-800',
        description: 'text-xs text-gray-600 text-center',
        trophy: {
          container: '-top-4',
          size: 'w-10 h-10',
          padding: 'p-1.5'
        },
        icons: {
          container: 'top-2 right-2 gap-1',
          size: 'w-3 h-3'
        }
      }
    : {
        container: `relative   ${ index == 0 ? '' : index == 1 ? 'mt-24' : index % 2 == 1 ? 'mt-4' : '-mt-20'}`,
        style: {},
        circle: 'aspect-square rounded-lg  bg-white shadow-xl p-8 flex flex-col items-center border-4 border-gray-200 overflow-hidden',
        innerCircle: '',
        imageContainer: 'w-full h-32 mb-4 relative',
        title: 'text-2xl font-bold text-gray-800',
        description: 'text-gray-600 text-center',
        trophy: {
          container: '-top-6',
          size: 'w-8 h-8',
          padding: 'p-2'
        },
        icons: {
          container: 'top-4 right-4 gap-2',
          size: 'w-6 h-6'
        }
      };

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className={circleClasses.container}
      style={circleClasses.style}
    >
        <div >
      <div className="relative">
        {/* Trophy Icon */}
        {winner && winner.id === item.id && (<div className={`absolute ${circleClasses.trophy.container} left-1/2 transform -translate-x-1/2 z-10`}>
          <div className={`bg-yellow-400 rounded-full ${circleClasses.trophy.padding} shadow-lg`}>
            <Trophy className={`${circleClasses.trophy.size} text-white`} />
          </div>
        </div>)}
        {/* Trophy Icon */}
        {/* {item.leadingMetrics && item.leadingMetrics.length > 0 && (<div className={`absolute ${circleClasses.trophy.container} left-1/5 transform -translate-x-1/4 z-10`}>
          <div className={`bg-purple-400 rounded-full ${circleClasses.trophy.padding} shadow-lg`}>
            <Target className={`${circleClasses.trophy.size} text-white`} />
          </div>
        </div>)} */}

        {/* Main Circle */}
        <div className={isMobile ? circleClasses.circle : ''}>
          <div 
            className={isMobile ? circleClasses.innerCircle : circleClasses.circle}
            style={{
              backgroundColor: winner && winner.id !== item.id ? 
                item.item_color_string.substring(0, item.item_color_string.length - 1) + ', 0.2)' : 
                item.item_color_string.substring(0, item.item_color_string.length - 1) + ', 0.5)',
              borderColor: winner && winner.id !== item.id ? 
                item.item_color_string.substring(0, item.item_color_string.length - 1) + ', 0.3)' : 
                item.item_color_string
            }}
          >
            {/* Background Circles */}
            {winner && winner.id !== item.id && (
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute rounded-full" 
                  style={{ 
                    backgroundColor: item.item_color_string.substring(0, item.item_color_string.length - 1) + ', 0.15)',
                    width: `${Math.min(400, 80 + item.votesPercentage * 5)}px`,
                    height: `${Math.min(400, 80 + item.votesPercentage * 5)}px`,
                    zIndex: 0,
                    left: '30%',
                    top: '30%',
                    transform: 'translate(-30%, -30%)'
                  }}
                />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute rounded-full" 
                  style={{ 
                    backgroundColor: item.item_color_string.substring(0, item.item_color_string.length - 1) + ', 0.3)',
                    width: `${Math.min(300, 60 + item.votesPercentage * 3)}px`,
                    height: `${Math.min(300, 60 + item.votesPercentage * 3)}px`,
                    zIndex: 1,
                    left: '30%',
                    top: '30%',
                    transform: 'translate(-30%, -30%)'
                  }}
                />
              </div>
            )}
            {/* Image or Fallback */}
            <div className={circleClasses.imageContainer}>
              {item.image && item.image.length > 0 ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-t-full"
                  onError={(e) => {
                    console.error('Error loading image:', e);
                  }}
                />
              ) : null}
            </div>
            <h3 className={circleClasses.title}>{item.name}</h3>
            <p className={circleClasses.description}>{item.description}</p>
            <div className={`w-full flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} items-center`}>
              <div className='flex flex-row items-center'>
                
          {item.leadingMetrics && item.leadingMetrics.length > 0 && (
            <div className="flex items-center px-3 rounded-lg rounded-b-full" >
            {index % 2 === 0 && (<Target className={`w-4 h-4 text-purple-600 mr-1`} />)}
            <span className="text-sm font-medium text-purple-600 dark:text-purple-300">
                
                {item.leadingMetrics?.slice(0, 1).map((metric) => 
                  splitAndJoin(metric.metric_name)
                ).join(', ')} {item.leadingMetrics?.length > 1 && `+${item.leadingMetrics?.length - 1}`}
              </span>
            {index % 2 === 1 && (<Target className={`w-4 h-4 text-purple-600 ml-1`} />)}
            </div>
          )}
              </div>
              
            </div>

          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default ComparisonCircle; 