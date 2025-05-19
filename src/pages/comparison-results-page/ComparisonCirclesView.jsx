import React, { useState, useEffect } from 'react';
import ComparisonCircle from './ComparisonCircle';
import CenterStage from './CenterStage';
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
import { useHeader } from '../../contexts/HeaderContext';

const List = ({displayItems, isMobile, winner, runnerUp, comparison, totalVotes, animationState}) => {
    return (
        <div>
            {/* Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-0">
                {displayItems.map((item, index) => {
                    const isInCenterStage = animationState === 'winner' && item.id === winner?.id;
                    const isRunnerUp = item.id === runnerUp?.id;
                    const shouldShow = true;// !isRunnerUp || animationState === 'rest';
                    
                    return (
                        <div
                            key={item.id}
                            className="flex w-full"
                            style={{ 
                                opacity: isInCenterStage ? 0 : (shouldShow ? 1 : 0),
                                transition: 'opacity 0.2s ease-in-out'
                            }}
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
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ComparisonCirclesView = ({ items, comparisonMetrics, comparison, userVotedAll }) => {
    const displayItems = calculateProcessedItems(items, comparisonMetrics);
    const navigate = useNavigate();
    const winner = userVotedAll ? findWinner(displayItems) : null;
    const runnerUp = userVotedAll ? findRunnerUp(displayItems) : null;
    const totalVotes = userVotedAll ? countTotalVotes(displayItems) : null;

    const {isHeaderVisible} = useHeader();
    const [animationState, setAnimationState] = useState(userVotedAll ? 'winner' : 'rest');
    const [scale, setScale] = useState(1);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        if (!userVotedAll) return;

        const sequence = async () => {
            setAnimationState('winner');
            await new Promise(resolve => setTimeout(resolve, 1500));
            setAnimationState('rest');
        };

        sequence();
    }, [userVotedAll]);

    // Add scroll event listener for scaling
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Calculate scale based on scroll position
            const newScale = Math.max(0.8, 1 - (currentScrollY * 0.001)); // Scale between 0.8 and 1
            setScale(newScale);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className='flex flex-col'>
                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                        <AnimatePresence mode="wait">
                            {animationState === 'winner' && winner && (
                                <CenterStage
                                    item={winner}
                                    isMobile={false}
                                    comparison={comparison}
                                    winner={winner}
                                    runnerUp={runnerUp}
                                    totalVotes={totalVotes}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                        <AnimatePresence mode="wait">
                            {animationState === 'winner' && winner && (
                                <CenterStage
                                    item={winner}
                                    isMobile={true}
                                    comparison={comparison}
                                    winner={winner}
                                    runnerUp={runnerUp}
                                    totalVotes={totalVotes}
                                />
                            )}
                        </AnimatePresence>
                    </div>

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