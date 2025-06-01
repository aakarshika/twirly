import React, { useState } from 'react';
import { Heart, Info } from 'lucide-react';
import VoteStats from './VoteStats/VoteStats';
import { useVotedCard } from '../../../hooks/useVotedCard';
import './ComparisonItemCard.css';
import { changeColorAlpha, darkenColor } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/common/Modal';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Sparkles, CupSoda, TargetIcon } from 'lucide-react';


const VotedCard = ({
  item,
  handleRevertClick,
  totalVotes = 0,
  isVotedItem,
  userVotedAll,
  winner,
  runnerUp
}) => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    titleRef,
    itemImage,
    color
  } = useVotedCard({
    item,
    handleRevertClick,
    totalVotes,
    isVotedItem
  });

  const handleItemClick = (e) => {
    navigate(`/item/${item.id}`);
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };
  const [expandedType, setExpandedType] = useState(null);
  const badgeClasses = {
      container: "rounded-full z-10",
      badge: " gap-1.5 rounded-full p-1 rounded-full items-center justify-center",
      icon: "w-14 h-14",
      text: "text-xs font-semibold",
      sparkles: "w-3 h-3"
  } ;
  return (
    <div className={`flex flex-col bg-white w-full rounded-lg ${isVotedItem ? 'voted-card-border' : ''}`} >
      <div
        className={`comparison-item-card rounded-lg `}
        style={{ 
          aspectRatio: '1/1',
          height: itemImage ? '25vh': '20vh' ,
          backgroundImage: isVotedItem ? `linear-gradient(to bottom, ${color}, ${changeColorAlpha(color, 0.8)} , ${changeColorAlpha(color, 0.2)}` : `linear-gradient(to bottom, ${changeColorAlpha(color, 0.2)}, ${changeColorAlpha(color, 0.2)} , ${changeColorAlpha(color, 0.2)}`
        }}
      >
        <div className="card-container">
          <div className="image-container">
            {itemImage ? (
              <img
                src={itemImage}
                alt={item.name}
                className="item-image"
                loading="lazy"
              />
            ) : (
              <div
                className="flex h-full justify-center flex-col items-center p-3"
              >
                <div className="flex justify-center items-center">
                  <h3 ref={titleRef} className="text-center" style={{ color: darkenColor(color, 70) }}>{item.name}</h3>

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
                                        className='p-2'
                                    >
                                        <Trophy onClick={() => setExpandedType("Winner")} className={`${badgeClasses.icon} items-center justify-center`} color = 'rgb(237, 193, 21)' fill = 'rgb(244, 213, 90)' />
                                        {expandedType === "Winner" && (
                                            <div className='flex flex-col items-center justify-center text-center text-black'>
                                                <h4 className='text-xs font-semibold'>Winning <br></br>Cup</h4>
                                            </div>
                                        )}
                                    </motion.div>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, 5, 0, -5, 0],
                                            scale: [1, 1.05, 1]
                                        }}
                                        className='p-2'
                                    >
                                        <CupSoda onClick={() => setExpandedType("Runner Up")} className={`${badgeClasses.icon}`} color = 'rgb(70, 137, 243)' fill = 'rgb(137, 179, 246)'  />
                                        {expandedType === "Runner Up" && (
                                            <div className='flex flex-col items-center justify-center text-center text-black'>
                                                <h4 className='text-xs font-semibold'>Runner <br></br>Cup</h4>
                                            </div>
                                        )}
                                    </motion.div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
                </div>
                <div className="p-2 w-full" style={{ color: darkenColor(color, 80) }}>
                  <VoteStats
                    votes={item.voteCount}
                    totalVotes={totalVotes}
                    color={color}
                    isVotedItem={isVotedItem}
                    leadingMetrics={item.leadingMetrics}
                    userVotedAll={userVotedAll}
                  />
                </div>
              </div>
            )}
          </div>

          {itemImage && (
            <div 
              className="bottom-0 left-0 right-0 p-4 content-overlay" 
              style={{ color: darkenColor(color, 50)}}
            >
              <h3 className="item-name">{item.name}</h3>

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
                                        className='p-2'
                                    >
                                        <Trophy onClick={() => setExpandedType("Winner")} className={`${badgeClasses.icon} items-center justify-center`} color = 'rgb(237, 193, 21)' fill = 'rgb(244, 213, 90)' />
                                        {expandedType === "Winner" && (
                                            <div className='flex flex-col items-center justify-center text-center text-black'>
                                                <h4 className='text-xs font-semibold'>Winning <br></br>Cup</h4>
                                            </div>
                                        )}
                                    </motion.div>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, 5, 0, -5, 0],
                                            scale: [1, 1.05, 1]
                                        }}
                                        className='p-2'
                                    >
                                        <CupSoda onClick={() => setExpandedType("Runner Up")} className={`${badgeClasses.icon}`} color = 'rgb(70, 137, 243)' fill = 'rgb(137, 179, 246)'  />
                                        {expandedType === "Runner Up" && (
                                            <div className='flex flex-col items-center justify-center text-center text-black'>
                                                <h4 className='text-xs font-semibold'>Runner <br></br>Cup</h4>
                                            </div>
                                        )}
                                    </motion.div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
              <div 
                className="flex items-center gap-2"
              >
                <VoteStats
                  votes={item.voteCount}
                  totalVotes={totalVotes}
                  color={color}
                  isVotedItem={isVotedItem}
                  leadingMetrics={item.leadingMetrics}
                  userVotedAll={userVotedAll}
                />
              </div>
            </div>
          )}

          <div className="absolute top-0 right-0 z-20">
            {isVotedItem && (
              <button
                className="you-voted-badge"
                onClick={handleRevertClick}
                type="button"
              >
                <Heart size={24} fill={'red'} />
              </button>
            )}
          </div>

          <div className="absolute bottom-2 right-2 z-20">
            <button
              className="p-2 rounded-full hover:bg-black/10 transition-colors"
              onClick={handleInfoClick}
              style={{ 
                color: darkenColor(color, 50),
                backgroundColor: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={item.name}
        size="md"
        className="absolute justify-center items-center bg-white dark:bg-gray-900 text-black dark:text-white"
      >
        <div className="space-y-4">
          {itemImage && (
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={itemImage}
                alt={item.name}
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          
          <div className="flex justify-center">
            <button
              onClick={handleItemClick}
              className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              Go to Item Page
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VotedCard; 