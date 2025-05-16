import React, { useEffect, useState } from 'react';
import { User, Clock, MessageCircle, ThumbsUp, Target, ThumbsUpIcon, PartyPopper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import VotedCard from '../comparison-aspect-page/ComparisonItemCard/VotedCard';
import ComparisonCircle from './ComparisonCircle';
import AspectsProgressBar from './AspectsProgressBar';

const ComparisonMetadata = ({ comparison, isMobile, userVotedAll, winner, runnerUp, totalVotes, comparisonMetrics, playedAspects, onAspectClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerClasses = isMobile
    ? 'w-full px-4 mb-6 mt-10'
    : 'w-full mb-8 mt-4';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className='flex flex-col w-full h-full'
    >
      <div className='relative'>
        <div className={containerClasses}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-xl bg-gradient-to-b from-amber-300 to-white-600 p-6 m-2 text-white"
          >
          {userVotedAll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center space-x-3 mb-4"
            >
              <PartyPopper className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-center">The Results Are In!</h2>
              <PartyPopper className="w-6 h-6 text-amber-500" />
            </motion.div>
          )}
          {!userVotedAll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center space-x-3 mb-4"
            >
              <h2 className="text-lg font-bold text-center">Keep voting to reveal results</h2>
            </motion.div>
          )}

<motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col w-full items-center justify-center text-amber-500 space-x-2 bg-amber-100 rounded-lg p-3 mb-2"
              >
                <div className='flex flex-row items-center gap-2'>
                  <h4 className='text-sm'>{comparison.name}</h4>
                </div>
              </motion.div>
            {!userVotedAll && (<AspectsProgressBar
              comparisonMetrics={comparisonMetrics}
              playedAspects={playedAspects}
              onAspectClick={onAspectClick}
            />)}
            <div className="flex flex-col space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col w-full items-center justify-center text-amber-500 space-x-2 bg-amber-100 rounded-lg p-3"
              >
                <div className='flex flex-row items-center gap-2'>
                  <ThumbsUpIcon className="w-5 h-5 " />
                  <span className="text-sm">{totalVotes || 0}</span><span> votes</span>
                </div>
              </motion.div>

              <div className="flex flex-col">
                {winner && (<motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center space-x-2 rounded-lg p-3 mr-8"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-2 mx-px rounded-sm"
                        style={{
                          backgroundColor: i > (10 * (winner?.votes || 0)) / totalVotes ? 'rgba(255, 255, 255, 0.5)' : 'rgba(248, 127, 127, 0.85)'
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ width: '16rem', height: '16rem' }}>
                    <ComparisonCircle
                      key={winner?.id || 'winner'}
                      item={winner}
                      index={0}
                      isMobile={true}
                      winner={winner}
                      comparison={comparison}
                      totalVotes={totalVotes}
                    />
                  </div>
                </motion.div>
                )}
                {runnerUp && (<motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center space-x-2 rounded-lg p-3 ml-8"
                >
                  <div className='w-60 h-60'>
                    <ComparisonCircle
                      key={runnerUp?.id || 'runnerUp'}
                      item={runnerUp}
                      index={1}
                      isMobile={true}
                      runnerUp={runnerUp}
                      comparison={comparison}
                      totalVotes={totalVotes}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-2 mx-px rounded-sm"
                        style={{
                          backgroundColor: i > (10 * (runnerUp?.votes || 0)) / totalVotes ? 'rgba(255, 255, 255, 0.5)' : 'rgba(248, 127, 127, 0.85)'
                        }}
                      />
                    ))}
                  </div>
                </motion.div>)}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </motion.div>
  );
};

export default ComparisonMetadata; 