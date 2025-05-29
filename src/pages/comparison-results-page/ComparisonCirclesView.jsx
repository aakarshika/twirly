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
import { changeColorAlpha, getPublicUrl } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';


import { motion, AnimatePresence } from 'framer-motion';
import { useHeader } from '../../contexts/HeaderContext';
import { formatDistanceToNow } from 'date-fns';


const List = ({displayItems, isMobile, winner, runnerUp, comparison, totalVotes, celebratingResults, userVotedAll}) => {
    const [displayItemssss, setDisplayItemssss] = useState(displayItems && displayItems.length > 0 ? displayItems.slice(0, 1) : []);
    const [winnerAnnouncement, setWinnerAnnouncement] = useState(false);
    const [runnerUpAnnouncement, setRunnerUpAnnouncement] = useState(false);
    useEffect(() => {
        if(celebratingResults) {
            setWinnerAnnouncement(true);
            setDisplayItemssss(displayItems && displayItems.length > 0 ? displayItems.slice(0, 1) : []);
            setTimeout(() => {
                setDisplayItemssss(displayItems.slice(1, 2));
                setWinnerAnnouncement(false);
                setRunnerUpAnnouncement(true);
            }, 3000);
            setTimeout(() => {
                setDisplayItemssss(displayItems);
                setRunnerUpAnnouncement(false);
            }, 6000);
        } else {
            setDisplayItemssss(displayItems);
        }
    }, [celebratingResults]);
    return (
        <div>

      <div className="p-3">
        <div>
          <div className={`grid ${displayItemssss.length === 1 ? 'grid-cols-1' :
            displayItemssss.length === 2 ? 'grid-cols-2' :
              displayItemssss.length % 3 === 0 ? 'grid-cols-3' :
                'grid-cols-2'
            }`}
            style={{
              gap: '1vh'
            }}
          >
            {winnerAnnouncement && (
            <div className="flex flex-col items-center justify-center">
                <div className="rounded-full bg-amber-200 p-2 px-4">
                        <div className="text-lg text-gray-500 font-bold">
                            And the WINNER is...
                        </div>
                    </div>
                </div>
            )}
            {runnerUpAnnouncement && (
                <div className="flex flex-col items-center justify-center">
                    <div className="rounded-full bg-amber-200 p-2 px-4">
                        <div className="text-lg text-gray-500 font-bold">
                            RUNNER CUP goes to...
                        </div>
                    </div>
                </div>
            )}
            {displayItemssss.map((item, i) => (
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

const ComparisonCirclesView = ({ items, comparisonMetrics, comparison, userVotedAll, celebratingResults }) => {
    const displayItems = calculateProcessedItems(items, comparisonMetrics);
    const navigate = useNavigate();
    const winner = userVotedAll ? findWinner(displayItems) : null;
    const runnerUp = userVotedAll ? findRunnerUp(displayItems) : null;
    const totalVotes = userVotedAll ? countTotalVotes(comparisonMetrics) : null;
    console.log(totalVotes, 'totalVotes');
    console.log(displayItems, 'displayItems');
    console.log(comparisonMetrics, 'comparisonMetrics');
    const {isHeaderVisible} = useHeader();
    const [scale, setScale] = useState(1);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { currentTheme } = useTheme();
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
                            celebratingResults={celebratingResults}
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
                            celebratingResults={celebratingResults}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-4 pl-4">
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

                {/* Creator Info */}
                {/* <div className='flex flex-row items-center justify-start'>
                <h4 className='text-md text-gray-500 p-2 w-full' style={{backgroundColor: changeColorAlpha(currentTheme.colors.background, 0.2)}}>
                    Results
                </h4> 
                </div> */}
            </div>
        </div>
    );
};

export default ComparisonCirclesView; 