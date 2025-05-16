import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Image, ThumbsUp, Target, User, Clock, MessageCircle, ThumbsUp as ThumbsUpIcon, Sparkles, CupSoda } from 'lucide-react';
import { splitAndJoin, getRGB, getPublicUrlItems } from '../../lib/utils';
import { hasAnyClearLeader } from '../../services/comparisonService';
import { formatDistanceToNow } from 'date-fns';


const ComparisonCircle = ({ item, index, isMobile = false, winner, runnerUp, totalVotes}) => {
    const itemColor = getRGB(item.item_color_string);
    const itemImage = item.image && item.image.startsWith('http') ? item.image : getPublicUrlItems(item.image);

  const circleClasses = isMobile
    ? {
        container: `relative w-full h-full`,
        style: {  },
        circle: 'aspect-square relative w-full h-full pb-[100%]',
        innerCircle: 'absolute inset-0  rounded-lg bg-white shadow-xl p-5 flex flex-col items-center border-4 border-gray-200 overflow-hidden',
        imageContainer: 'max-h-20 max-w-40',
        title: 'text-lg font-bold text-gray-800',
        description: 'text-xs text-gray-600 text-center',
        trophy: {
          container: '-top-4',
          size: 'w-10 h-10',
          padding: 'p-1.5',
          badge: 'bg-gradient-to-r from-yellow-400 to-yellow-500'
        },
        runnerUp: {
          container: '-top-4',
          size: 'w-10 h-10',
          padding: 'p-1.5',
          badge: 'bg-gradient-to-r from-blue-400 to-blue-500'
        },
        icons: {
          container: 'top-2 right-2 gap-1',
          size: 'w-3 h-3'
        },
        leadingMetrics: {
          container: 'bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-1.5 rounded-full',
          text: 'text-sm font-medium text-purple-700'
        }
      }
    : {
        container: `relative `,//  ${ index == 0 ? '' : index == 1 ? 'mt-24' : index % 2 == 1 ? 'mt-4' : '-mt-20'}`,
        style: {},
        circle: 'aspect-square  rounded-lg  bg-white shadow-xl p-8 flex flex-col items-center border-4 border-gray-200 overflow-hidden',
        innerCircle: '',
        imageContainer: 'w-full h-32 mb-4 relative',
        title: 'text-2xl font-bold text-gray-800',
        description: 'text-gray-600 text-center',
        trophy: {
          container: '-top-6',
          size: 'w-8 h-8',
          padding: 'p-2',
          badge: 'bg-gradient-to-r from-yellow-400 to-yellow-500'
        },
        icons: {
          container: 'top-4 right-4 gap-2',
          size: 'w-6 h-6'
        },
        leadingMetrics: {
          container: 'bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 rounded-full',
          text: 'text-sm font-medium text-purple-700'
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
        {/* {item.leadingMetrics && item.leadingMetrics.length > 0 && (<div className={`absolute ${circleClasses.trophy.container} left-1/5 transform -translate-x-1/4 z-10`}>
          <div className={`bg-purple-400 rounded-lg ${circleClasses.trophy.padding} shadow-lg`}>
            <Target className={`${circleClasses.trophy.size} text-white`} />
          </div>
        </div>)} */}

        {/* Main Circle */}
        <div className={isMobile ? circleClasses.circle : ''}>
          <motion.div 
            className={isMobile ? circleClasses.innerCircle : circleClasses.circle}
            style={{
              backgroundColor: winner && winner.id !== item.id ? 
                itemColor.substring(0, itemColor.length - 1) + ', 0.2)' : 
                itemColor.substring(0, itemColor.length - 1) + ', 0.5)',
              borderColor: winner && winner.id !== item.id ? 
                itemColor.substring(0, itemColor.length - 1) + ', 0.3)' : 
                itemColor
            }}
            animate={winner && winner.id === item.id ? {
              boxShadow: [
                "0 0 0 0 rgba(234, 179, 8, 0.4)",
                "0 0 20px 10px rgba(234, 179, 8, 0.2)",
                "0 0 0 0 rgba(234, 179, 8, 0.4)"
              ]
            } : {}}
            transition={winner && winner.id === item.id ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : {}}
          >
            {/* Background Circles */}
            {winner && winner.id !== item.id && (
              <div className="absolute inset-0  rounded-lg overflow-hidden">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute rounded-full" 
                  style={{ 
                    backgroundColor: itemColor.substring(0, itemColor.length - 1) + ', 0.15)',
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
                    backgroundColor: itemColor.substring(0, itemColor.length - 1) + ', 0.3)',
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
              {itemImage && itemImage.length > 0 ? (
                <img
                  src={itemImage}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-t-full"
                  onError={(e) => {
                    console.error('Error loading image:', e);
                  }}
                />
              ) : <div className='mt-10'></div>}
            </div>
            <h3 className={circleClasses.title}>{item.name}</h3>

        {/* Winner Badge with Animation */}
        {winner && winner.id === item.id && (
          <motion.div 
            className={` ${circleClasses.trophy.container} `}
            initial={{ scale: 0.8, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className={`flex flex-row items-center gap-2 ${circleClasses.trophy.badge} rounded-lg ${circleClasses.trophy.padding} shadow-lg`}
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(234, 95, 8, 0.4)",
                  "0 0 0 10px rgba(234, 179, 8, 0)",
                  "0 0 0 0 rgba(8, 87, 234, 0.4)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Trophy className={`${circleClasses.trophy.size} text-white`} />
              </motion.div>
              
              <div className='flex flex-col items-center'>
              <span className="text-sm font-semibold text-white">Winner </span>
              <span className="text-sm font-semibold text-white">cup</span>
              </div>{item.votesPercentage.toFixed(0)}%
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>
        )}

        {/* Runner Up Badge with Animation */}
        {runnerUp && runnerUp.id === item.id && (
          <motion.div 
            className={` ${circleClasses.runnerUp.container} `}
            initial={{ scale: 0.8, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className={`flex flex-row items-center gap-2 ${circleClasses.runnerUp.badge} rounded-lg ${circleClasses.runnerUp.padding} shadow-lg`}
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(234, 95, 8, 0.4)",
                  "0 0 0 10px rgba(234, 179, 8, 0)",
                  "0 0 0 0 rgba(8, 87, 234, 0.4)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <CupSoda className={`${circleClasses.runnerUp.size} text-white`} />
              </motion.div>
              <div className='flex flex-col items-center'>
              <span className="text-sm font-semibold text-white">Runner </span>
              <span className="text-sm font-semibold text-white">cup</span>
              </div>
            </motion.div>
          </motion.div>
        )}

            {/* <p className={circleClasses.description}>{item.description}</p> */}
            <div className={`w-full flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} items-center`}>
              <div className='flex flex-row items-center'>
                
          {item.leadingMetrics && item.leadingMetrics.length > 0 && (
            <motion.div 
              className={`${circleClasses.leadingMetrics.container} flex items-center gap-2 mt-2`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {index % 2 === 0 && (
                <motion.div
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Target className="w-4 h-4 text-purple-600" />
                </motion.div>
              )}
              <span className={circleClasses.leadingMetrics.text}>
                {item.leadingMetrics?.slice(0, 1).map((metric) => 
                  splitAndJoin(metric.metric_name)
                ).join(', ')} {item.leadingMetrics?.length > 1 && `+${item.leadingMetrics?.length - 1}`} 
                {/* {item.leadingMetrics?.length - 1 > 1 ? 'hits' : 'hit'} */}
              </span>
              {index % 2 === 1 && (
                <motion.div
                  animate={{ rotate: [0, -10, 0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Target className="w-4 h-4 text-purple-600" />
                </motion.div>
              )}
            </motion.div>
          )}
              </div>
              
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default ComparisonCircle; 