import React, { useState, useEffect } from 'react';
import ComparisonCircle from './ComparisonCircle';
import {
    findWinner,
    findRunnerUp,
    countTotalVotes,
    calculateProcessedItems
} from '../../services/comparisonService';
import Avatar from '../../components/common/Avatar';
import { getPublicUrl } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';

const List = ({displayItems, isMobile, winner, runnerUp, comparison, totalVotes, animationState}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 m-4 mt-0">
            {displayItems.map((item, index) => {
                const isWinner = winner?.id === item.id;
                const isRunnerUp = runnerUp?.id === item.id;
                const isOther = !isWinner && !isRunnerUp;
                
                // Determine animation state based on the current animation phase
                let animationProps = {
                    initial: { opacity: 0, scale: 0.8 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { duration: 0.5 }
                };

                if (animationState === 'winner' && isWinner) {
                    animationProps = {
                        initial: { opacity: 0, scale: 0.8, zIndex: 50 },
                        animate: { 
                            opacity: 1, 
                            scale: 1.2,
                            zIndex: 50,
                            transition: { duration: 0.5 }
                        },
                        exit: { 
                            scale: 1,
                            zIndex: 1,
                            transition: { duration: 0.5, delay: 0.5 }
                        }
                    };
                } else if (animationState === 'runnerUp' && isRunnerUp) {
                    animationProps = {
                        initial: { opacity: 0, scale: 0.8, zIndex: 40 },
                        animate: { 
                            opacity: 1, 
                            scale: 1.1,
                            zIndex: 40,
                            transition: { duration: 0.5 }
                        },
                        exit: { 
                            scale: 1,
                            zIndex: 1,
                            transition: { duration: 0.5, delay: 0.5 }
                        }
                    };
                } else if (animationState === 'rest' && isOther) {
                    animationProps = {
                        initial: { opacity: 0, scale: 0.8 },
                        animate: { 
                            opacity: 1, 
                            scale: 1,
                            transition: { duration: 0.5, delay: 0.2 * index }
                        }
                    };
                }

                return (
                    <motion.div
                        key={item.id}
                        layout
                        {...animationProps}
                    >
                        <ComparisonCircle
                            item={item}
                            index={index}
                            isMobile={isMobile}
                            comparison={comparison}
                            winner={winner}
                            runnerUp={runnerUp}
                            totalVotes={totalVotes}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
};

const ComparisonCirclesView = ({ items, comparisonMetrics, comparison, userVotedAll }) => {
    const displayItems = calculateProcessedItems(items, comparisonMetrics);
    const navigate = useNavigate();
    const winner = userVotedAll ? findWinner(displayItems) : null;
    const runnerUp = userVotedAll ? findRunnerUp(displayItems) : null;
    const totalVotes = userVotedAll ? countTotalVotes(displayItems) : null;

    const [animationState, setAnimationState] = useState(userVotedAll ? 'winner' : 'rest');

    useEffect(() => {
        if (!userVotedAll) return;

        const sequence = async () => {
            // Start with winner animation
            setAnimationState('winner');
            
            // After winner animation completes, show runner up
            await new Promise(resolve => setTimeout(resolve, 1500));
            setAnimationState('runnerUp');
            
            // Finally show the rest of the items
            await new Promise(resolve => setTimeout(resolve, 1500));
            setAnimationState('rest');
        };

        sequence();
    }, [userVotedAll]);

    const containerClasses = true
        ? 'w-full px-4 mb-6 mt-10'
        : 'w-full mb-8 mt-4';

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
                {/* Desktop Layout */}
                <div className="hidden sm:block">
                    <List 
                        displayItems={displayItems}
                        winner={winner}
                        runnerUp={runnerUp}
                        isMobile={false}
                        comparison={comparison}
                        totalVotes={totalVotes}
                        animationState={animationState}
                    />
                </div>

                {/* Mobile Layout */}
                <div className="sm:hidden">
                    <List 
                        displayItems={displayItems}
                        winner={winner}
                        runnerUp={runnerUp}
                        isMobile={true}
                        comparison={comparison}
                        totalVotes={totalVotes}
                        animationState={animationState}
                    />
                </div>

                {/* Creator Info */}
                <div className="flex items-center gap-3 mt-8 p-4 bg-white rounded-lg shadow-sm">
                    <Avatar 
                        profileImageUrl={comparison.user?.profile_image_url ? getPublicUrl(comparison.user?.profile_image_url) : null}
                        displayName={comparison.user?.display_name}
                        username={comparison.user?.username}
                        size="sm"
                        isEditable={false}
                    />
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                            Created by <span className="font-medium text-gray-900">{comparison.user?.display_name || 'Anonymous'}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                            {comparison.created_at && new Date(comparison.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonCirclesView; 