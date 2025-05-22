import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Sparkles, CupSoda, TargetIcon } from 'lucide-react';
import { splitAndJoin, getRGB, getPublicUrlItems, darkenColor, changeColorAlpha } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import VotedCard from '../comparison-aspect-page/ComparisonItemCard/VotedCard';

const ComparisonCircle = ({ item, index, isMobile = false, winner, runnerUp, totalVotes, userVotedAll }) => {
    const itemColor = getRGB(item.item_color_string);
    const itemImage = item.image_url && item.image_url.startsWith('http') ? item.image_url : getPublicUrlItems(item.image_url);

    const { currentTheme } = useTheme();
    const badgeClasses = isMobile ? {
        container: "absolute right-0 top-0 rounded-full z-10",
        badge: " gap-1.5 rounded-full p-1 rounded-full items-center justify-center",
        icon: "w-8 h-8",
        text: "text-xs font-semibold",
        sparkles: "w-3 h-3"
    } : {
      container: "absolute right-0 top-0 rounded-full z-10",
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
            className="relative flex flex-col items-center"
        >
        
            <motion.div 
                className=" bg-white w-full h-full rounded-xl overflow-hidden"
                style={{
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

                <VotedCard 
                    item={item} 
                    userVotedAll={userVotedAll} 
                    totalVotes={totalVotes}
                    votes={item.votes}
                    leadingMetrics={item.leadingMetrics}
                />
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

        </div>
    );
};

export default ComparisonCircle; 