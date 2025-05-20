import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Sparkles, CupSoda, TargetIcon } from 'lucide-react';
import { splitAndJoin, getRGB, getPublicUrlItems, darkenColor, changeColorAlpha } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

const ComparisonCircle = ({ item, index, isMobile = false, winner, runnerUp, totalVotes }) => {
    const itemColor = getRGB(item.item_color_string);
    const itemImage = item.image_url && item.image_url.startsWith('http') ? item.image_url : getPublicUrlItems(item.image_url);

    const { currentTheme } = useTheme();
    const badgeClasses = isMobile ? {
        container: "absolute right-0 bottom-0 rounded-full z-10",
        badge: " gap-1.5 rounded-full p-1 rounded-full items-center justify-center",
        icon: "w-8 h-8",
        text: "text-xs font-semibold",
        sparkles: "w-3 h-3"
    } : {
      container: "absolute right-0 bottom-0 rounded-full z-10",
      badge: " gap-1.5 rounded-full p-1 rounded-full items-center justify-center",
      icon: "w-8 h-8",
        text: "text-sm font-semibold",
        sparkles: "w-4 h-4"
    };

    const titleRef = useRef(null);
  
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
  
    return (
        <div
            key={item.id}
            className="relative w-full h-full flex flex-col items-center"
        >
        
            <motion.div 
                className="relative bg-white w-full h-40 rounded-xl shadow-lg overflow-hidden"
                style={{
                        aspectRatio: '1/1',
                        height: itemImage ? '30vh': '20vh' ,
                        backgroundColor: changeColorAlpha(itemColor, 0.2)
                }}
                transition={winner && winner.id === item.id ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                } : runnerUp && runnerUp.id === item.id ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                } : {}}
            >

                <div className={`p-3`}>
                    {/* Image or Fallback */}
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                        {itemImage ? (
                            <>
                                <img
                                    src={itemImage}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </>
                        ) : (
                            <div 
                                className="flex flex-col h-full items-center justify-center"
                            >
                                {/* {winner && winner.id === item.id && (
                                  <div className="flex flex-col items-center justify-center">
                                    <span className="text-sm text-amber-500 font-medium">Winner Cup</span>
                                    <span className="text-xs text-gray-400 font-medium">goes to</span>
                                  </div>
                                  )}
                                  {runnerUp && runnerUp.id === item.id && (
                                  <div className="flex flex-col items-center justify-center">
                                    <span className="text-sm text-blue-500 font-medium">Runner Cup</span>
                                    <span className="text-xs text-gray-400 font-medium">goes to</span>
                                  </div>
                                  )} */}
                                <div className="flex flex-col items-center justify-center">
                                    
                <div className="flex justify-center items-center">
                  <h3 ref={titleRef} className="" style={{ color: darkenColor(item.item_color_string, 70) }}>{item.name}</h3>
                </div>
                                </div>
                                {item.votes?.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            {item.votes.length} votes
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {itemImage && (
            <div 
              className="bottom-0 left-0 right-0 p-4 content-overlay " 
              style={{  color: darkenColor(itemColor, 50)}}
            >
              <h3 className="item-name">{item.name}</h3>
            </div>
                    )}
                </div>
                {/* Status Badge - Winner or Runner Up */}
        {(winner?.id === item.id || runnerUp?.id === item.id) && (
            <motion.div 
                className={badgeClasses.container}
                initial={{ scale: 0.8, y: -10 }}
                animate={{ 
                    scale: [1, 1.05, 1],
                    y: [0, -5, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <motion.div 
                    className={`${badgeClasses.badge} ${
                        winner?.id === item.id 
                            ? ' bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400'
                            : ' bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400'
                    }`}
                    animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        backgroundSize: '200% 100%'
                    }}
                >
                    {winner?.id === item.id ? (
                        <>
                            <motion.div
                                animate={{ 
                                    rotate: [0, 10, 0, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className='p-2'
                            >
                                <Trophy className={`${badgeClasses.icon} text-white`} />
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <motion.div
                                animate={{ 
                                    rotate: [0, 5, 0, -5, 0],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className='p-2'
                            >
                                <CupSoda className={`${badgeClasses.icon} text-white`} />
                            </motion.div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        )}
            </motion.div> 

                    {/* Leading Metrics */}
                    {item.leadingMetrics && item.leadingMetrics.length > 0 && (
                        <div className="flex flex-col mt-2">
                            <motion.div 
                                key={'icon-target'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex items-center justify-start gap-1" style={{ color: currentTheme.colors.secondary }}>
                                    <Target className="w-4 h-4" />
                                    <span className="text-sm font-norm,al">
                                        Shining at
                                    </span>
                                </div>
                            </motion.div>
                            {item.leadingMetrics.map((metric, index) => (
                                <motion.div 
                                    key={metric.metric_name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="flex items-center justify-start" style={{ color: currentTheme.colors.secondary }}>
                                        
                                        <span className="text-sm font-semibold ml-5">
                                            {splitAndJoin(metric.metric_name)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
        </div>
    );
};

export default ComparisonCircle; 