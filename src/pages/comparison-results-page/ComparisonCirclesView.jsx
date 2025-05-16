import React from 'react';
import ComparisonCircle from './ComparisonCircle';
import {
    findWinner,
    findRunnerUp,
    countTotalVotes,
    calculateProcessedItems
  } from '../../services/comparisonService';
import ComparisonMetadata from './ComparisonMetadata';
import Avatar from '../../components/common/Avatar';
import { getPublicUrl } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
const List = ({displayItems, isMobile, winner, runnerUp, comparison, totalVotes}) => {
    return <>
    {displayItems.map((item, index) => item.id != winner?.id && item.id != runnerUp?.id && (
        <ComparisonCircle
            key={item.id}
            item={item}
            index={index}
            isMobile={isMobile}
            comparison={comparison}
            totalVotes={totalVotes}
        />
    ))}
    </>
};

const ComparisonCirclesView = ({ items, comparisonMetrics, comparison, userVotedAll }) => {
    // Ensure we have between 2 and 4 items
    const displayItems = calculateProcessedItems(
        items,
        comparisonMetrics
    );
    const navigate = useNavigate();
    console.log(comparisonMetrics, "comparisonMetrics");
    // Find the winner from the processed items
    const winner = userVotedAll ? findWinner(displayItems) : null;
    const runnerUp = userVotedAll ? findRunnerUp(displayItems) : null;
    const totalVotes = userVotedAll ? countTotalVotes(displayItems) : null;

    return (
        <div className="">
            <div className="max-w-7xl mx-auto ml-2 mr-2">
                {/* Metadata Section */}
                <ComparisonMetadata 
                  comparisonMetrics={comparisonMetrics}
                  playedAspects={comparisonMetrics.filter((aspect) => aspect.userVoted== true)}
                  onAspectClick={(clickedAspect) => {
                    if (clickedAspect.id!= 'results') {
                      navigate(`/comparison-aspect/${clickedAspect.id}`);
                    }
                  }}
                 comparison={comparison} winner={winner} runnerUp={runnerUp} isMobile={false} userVotedAll={userVotedAll} totalVotes={totalVotes} />
                {/* Desktop Layout */}
                <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 relative">
                    <List displayItems={displayItems}  winner={winner} runnerUp={runnerUp} isMobile={false} comparison={comparison} totalVotes={totalVotes} />
                </div>
                {/* Mobile Layout */}
                <div className=" sm:hidden grid grid-cols-2 gap-4 relative">
                    <List displayItems={displayItems}  winner={winner} runnerUp={runnerUp} isMobile={true} comparison={comparison} totalVotes={totalVotes} />
                </div>

          {/* Creator Info */}
          <div className="flex justify-start m-4 mb-0 space-x-2">
            <Avatar 
          profileImageUrl={comparison.user?.profile_image_url ? getPublicUrl(comparison.user?.profile_image_url) : null}
          displayName = {comparison.user?.display_name}
            username = {comparison.user?.username}
            size = 'sm'
            isEditable = {false}
            />
            <span className="text-lg text-gray-600">
              Created by {comparison.user?.display_name || 'Anonymous'}
            </span>
          </div>
          </div>
        </div>
    );
};

export default ComparisonCirclesView; 