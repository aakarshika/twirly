import { Maximize2, Send, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';
import { changeColorAlpha } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import VotingAnimation from '../comparison-aspect-page/ComparisonItemCard/VotingAnimation/VotingAnimation';
import { useNavigate } from 'react-router-dom';



const Grid = ({ layout = '2x2',  gridCollapsed = false , localOptions ,setData, handleVote, handleReset }) => {
  const hasVoted = setData.hasVoted;
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  return (
    // flex th =e grid tpo take up all the space
    <motion.div className={
      layout === '1x4'
        ? 'h-full grid grid-cols-4 gap-2 p-4'
        : 'h-full grid grid-cols-2 grid-rows-2 gap-2 p-4'
    }
    animate={{backgroundColor: gridCollapsed ?  'rgba(0, 0, 0, 0.05)' : 'transparent'}}
    transition={{duration: 0.5}}
    style={{backgroundColor: gridCollapsed ?  'rgba(0, 0, 0, 0.05)' : 'transparent'}}
    >
      {localOptions && localOptions.map((opt, i) => (
        <motion.div
          key={opt.name + i}
          className={`relative flex h-full items-center justify-center border rounded-xl h-16 text-md font-semibold ${opt.id === setData.votedItemId ? 'text-blue-600' : ''}`}
          initial={{
            backgroundColor: currentTheme.colors.background,
            boxShadow: opt.winner && hasVoted ? `0 0 15px ${changeColorAlpha(opt.item_color_string, 0.5)}` : 'none'
          }}
          animate={{
            scale: opt.winner && hasVoted? [1, 1.02, 1] : 1,
            boxShadow: opt.winner && hasVoted ? [
              `0 0 15px ${changeColorAlpha(opt.item_color_string, 0.5)}`,
              `0 0 25px ${changeColorAlpha(opt.item_color_string, 0.7)}`,
              `0 0 15px ${changeColorAlpha(opt.item_color_string, 0.5)}`
            ] : 'none'
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className='absolute w-full h-full m-2'>
            <div className='w-full h-full rounded-xl' style={{ backgroundColor: changeColorAlpha(opt.item_color_string, 0.05) }}></div>
          </div>

          {hasVoted && (
            !gridCollapsed ?
              (<div key={opt.name + i + '1'} className='absolute w-full h-full flex flex-col justify-between m-2'>
                <div className=''></div>
                <motion.div className='rounded-xl'
                  initial={{
                    backgroundColor: changeColorAlpha(opt.item_color_string, 0.4),
                    height: '0%', width: '100%'
                  }}
                  animate={{
                    backgroundColor: changeColorAlpha(opt.item_color_string, 0.4),
                    height: `${opt.votesPercentage}%`
                  }}
                  transition={{
                    duration: 1.5,
                    ease: [0.4, 0, 0.2, 1],
                    delay:  0.2
                  }}
                >
                </motion.div>
              </div>) :
              (<div key={opt.name + i + '2'} className='absolute w-full h-full flex flex-row justify-between m-2'>
                <div className=''></div>
                <motion.div className='rounded-xl'
                  initial={{
                    backgroundColor: changeColorAlpha(opt.item_color_string, 0.4),
                    width: '0%', height: '100%'
                  }}
                  animate={{
                    backgroundColor: changeColorAlpha(opt.item_color_string, 0.4),
                    width: `${opt.votesPercentage}%`
                  }}
                  transition={{
                    duration: 1.5,
                    ease: [0.4, 0, 0.2, 1],
                    delay:  0.2
                  }}
                >
                </motion.div>
              </div>)
          )}

          {hasVoted && setData.votedItemId === opt.id && (
            <motion.div 
              className='absolute top-0 left-0 m-2'
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              onClick={handleReset}
            >
              <ThumbsUp className='text-blue-600' color={hasVoted ? currentTheme.colors.primary : 'gray'} 
              fill={hasVoted ? changeColorAlpha(currentTheme.colors.primary, 0.5) : 'none'} 
              size={gridCollapsed ? 16 : 24} />
            </motion.div>
          )}
          

          {(
            <motion.div 
              className='absolute bottom-0 right-0 z-12 p-2 rounded-full bg-white/50'
              onClick={
                () => {
                  navigate(`/item/${opt.id}`);
                }
              }
            >
              <Maximize2 className='text-blue-600' color={'lightgray'} 
              fill={'none'} 
              size={gridCollapsed ? 8 : 12} />
            </motion.div>
          )}
          
          
          <div className={`flex items-center justify-center ${!gridCollapsed ? 'flex-col' : 'flex-row'}`}>
            <motion.span 
              className={`text-center ${gridCollapsed ? 'text-sm line-clamp-1 ml-4' : 'text-lg'}`}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0, scale: opt.id === setData.votedItemId ? [1.3, 1] : 1 }}
              transition={{ delay: 1 +  0.2 }}
            >
              {opt.name} 
            </motion.span>
            {hasVoted && (
              <motion.span 
                className={`text-lg ${gridCollapsed ? 'text-sm' : 'text-lg ml-2 '}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, scale: opt.id === setData.votedItemId ? [1, 1.2, 1] : 1 }}
                transition={{ delay: 1 +  0.2 }}
              >
                {opt.votesPercentage.toFixed(0)}%
              </motion.span>
            )}
          </div>

          {!hasVoted && (
            <div className="absolute inset-0">
              <VotingAnimation onVote={() => handleVote(opt.id)} />
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Grid; 