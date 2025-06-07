import { ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';
import { changeColorAlpha } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import VotingAnimation from '../comparison-aspect-page/ComparisonItemCard/VotingAnimation/VotingAnimation';



const Grid = ({ layout = '2x2', userVoted = false, gridCollapsed = false , localOptions ,hasVoted, totalVotes, handleVote, handleReset, selectedItemId }) => {
  const { currentTheme } = useTheme();
  return (
    // flex th =e grid tpo take up all the space
    <div className={
      layout === '1x4'
        ? 'h-full grid grid-cols-4 gap-2 p-4'
        : 'h-full grid grid-cols-2 grid-rows-2 gap-2 p-4'
    }
    >
      {localOptions && localOptions.map((opt, i) => (
        <motion.div
          key={opt.name + i}
          className={`relative flex h-full items-center justify-center border rounded-xl h-16 text-md font-semibold ${opt.id === selectedItemId ? 'text-blue-600' : ''}`}
          initial={{
            backgroundColor: currentTheme.colors.background,
            boxShadow: opt.winner && userVoted ? `0 0 15px ${changeColorAlpha(opt.color, 0.5)}` : 'none'
          }}
          animate={{
            scale: opt.winner && hasVoted? [1, 1.02, 1] : 1,
            boxShadow: opt.winner && hasVoted ? [
              `0 0 15px ${changeColorAlpha(opt.color, 0.5)}`,
              `0 0 25px ${changeColorAlpha(opt.color, 0.7)}`,
              `0 0 15px ${changeColorAlpha(opt.color, 0.5)}`
            ] : 'none'
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className='absolute w-full h-full m-2'>
            <div className='w-full h-full rounded-xl' style={{ backgroundColor: changeColorAlpha(opt.color, 0.03) }}></div>
          </div>

          {hasVoted && (
            !gridCollapsed ?
              (<div key={opt.name + i + '1'} className='absolute w-full h-full flex flex-col justify-between m-2'>
                <div className=''></div>
                <motion.div className='rounded-xl'
                  initial={{
                    backgroundColor: changeColorAlpha(currentTheme.colors.primary, 0.2),
                    height: '0%', width: '100%'
                  }}
                  animate={{
                    backgroundColor: changeColorAlpha(currentTheme.colors.primary, 0.2),
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
                    backgroundColor: changeColorAlpha(currentTheme.colors.primary, 0.2),
                    width: '0%', height: '100%'
                  }}
                  animate={{
                    backgroundColor: changeColorAlpha(currentTheme.colors.primary, 0.2),
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

          {hasVoted && selectedItemId === opt.id && (
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
              <ThumbsUp className='text-blue-600' />
            </motion.div>
          )}
          
          
          <div className={`flex items-center justify-center ${!gridCollapsed ? 'flex-col' : 'flex-row'}`}>
            <motion.span 
              className='text-lg text-center'
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0, scale: opt.id === selectedItemId ? [1.3, 1] : 1 }}
              transition={{ delay: 1 +  0.2 }}
            >
              {opt.name} 
            </motion.span>
            {hasVoted && (
              <motion.span 
                className='text-lg ml-2'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, scale: opt.id === selectedItemId ? [1, 1.2, 1] : 1 }}
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
    </div>
  );
};

export default Grid; 