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
import { formatDistanceToNow } from 'date-fns';

const List = ({displayItems, isMobile, winner, runnerUp, comparison, totalVotes, animationState, userVotedAll}) => {
    return (
        <div>

      <div className="p-3">
        <div>
          <div className={`grid ${displayItems.length === 1 ? 'grid-cols-1' :
            displayItems.length === 2 ? 'grid-cols-2' :
              displayItems.length % 3 === 0 ? 'grid-cols-3' :
                'grid-cols-2'
            }`}
            style={{
              gap: '1vh'
            }}
          >
            {displayItems.map((item, i) => (
              <div key={item.id} className="">
                
                <ComparisonCircle
                                item={item}
                                index={i}
                                isMobile={isMobile}
                                comparison={comparison}
                                winner={winner}
                                runnerUp={runnerUp}
                                totalVotes={totalVotes}
                                userVotedAll={userVotedAll}
                            />
              </div>
            ))}
          </div>
        </div>
      </div>
        </div>
    );
};

const ComparisonCirclesView = ({ items, comparisonMetrics, comparison, userVotedAll }) => {
    const displayItems = calculateProcessedItems(items, comparisonMetrics);
    const navigate = useNavigate();
    const winner = userVotedAll ? findWinner(displayItems) : null;
    const runnerUp = userVotedAll ? findRunnerUp(displayItems) : null;
    const totalVotes = userVotedAll ? countTotalVotes(comparisonMetrics) : null;
    console.log(totalVotes, 'totalVotes');
    console.log(displayItems, 'displayItems');
    console.log(comparisonMetrics, 'comparisonMetrics');
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
            <div className="">
                <div className='flex flex-col'>
                    {!userVotedAll && (
                        <div className="text-center text-sm text-gray-500">
                            Vote all to view results
                        </div>
                    )}
                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                        <List 
                            displayItems={displayItems}
                            winner={winner}
                            runnerUp={runnerUp}
                            isMobile={false}
                            comparison={comparison}
                            totalVotes={totalVotes}
                            userVotedAll={userVotedAll}
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
                            userVotedAll={userVotedAll}
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
                    <div className="flex flex-col" onClick={() => navigate(`/user/${comparison.user?.display_name}`)}>
                        <span className="text-sm text-gray-600">
                            Created by <span className="font-medium text-gray-900">{comparison.user?.display_name || 'Anonymous'}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatDistanceToNow(comparison.created_at && new Date(comparison.created_at).toLocaleDateString())}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonCirclesView; 