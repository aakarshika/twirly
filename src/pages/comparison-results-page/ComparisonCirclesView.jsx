import React from 'react';
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
const List = ({displayItems, isMobile, winner, runnerUp, comparison, totalVotes}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 m-4 mt-0">
            {displayItems.map((item, index) => //item.id != winner?.id && item.id != runnerUp?.id && 
            (
                <ComparisonCircle
                    key={item.id}
                    item={item}
                    index={index}
                    isMobile={isMobile}
                    comparison={comparison}
                    winner={winner}
                    runnerUp={runnerUp}
                    totalVotes={totalVotes}
                />
            ))}
        </div>
    );
};

const ComparisonCirclesView = ({ items, comparisonMetrics, comparison, userVotedAll }) => {
    const displayItems = calculateProcessedItems(items, comparisonMetrics);
    const navigate = useNavigate();
    const winner = userVotedAll ? findWinner(displayItems) : null;
    const runnerUp = userVotedAll ? findRunnerUp(displayItems) : null;
    const totalVotes = userVotedAll ? countTotalVotes(displayItems) : null;

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