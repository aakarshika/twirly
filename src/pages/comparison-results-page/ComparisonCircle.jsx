import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Sparkles, CupSoda, TargetIcon } from 'lucide-react';
import { splitAndJoin, getRGB, getPublicUrlItems, darkenColor, changeColorAlpha } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import VotedCard from '../comparison-aspect-page/ComparisonItemCard/VotedCard';

const ComparisonCircle = ({ item, index, isMobile = false, winner, runnerUp, totalVotes, userVotedAll }) => {
    

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
                    winner={winner}
                    runnerUp={runnerUp}
                />
                
            </motion.div> 

        </div>
    );
};

export default ComparisonCircle; 