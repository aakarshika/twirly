// File: src/components/comparison/ComparisonHeading.jsx

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ComparisonGridSkeleton from '../skeletons/ComparisonGridSkeleton';
import { splitAndJoin } from '../../lib/utils';

/**
 * Grid component to display comparison items
 */
const ComparisonHeading = ({ isHeaderVisible, title, height, currentId, itemReviews, metrics, comparisonMetrics }) => {
  
  const { 
    items, 
    userVoted, 
    loadNextSet,
    completedSets,
    currentSetIndex,
    handleVote,
    handleRevertVote,
    votedItemId
  } = useComparison();
  // console.log("height in grid",height);

  const { currentTheme } = useTheme();
  console.log("comparisonMetrics in comparison heading", comparisonMetrics);
  const navigate = useNavigate();

  const handleNextPoll = () => {
    if (currentId) {
      navigate(`/comparison/${currentId+1}`);
    }
  };
  // console.log('Height in ComparisonHeading:', height); // Check if height is logged correctly

  const heightValue = height; 

  // Extract the numeric part and convert it to a number
  const numericHeight = parseFloat(heightValue); 
  
  // Divide by 4
  const gap = '0vh'; 
  const gap2 = (numericHeight / 100) + 'vh'; 

  // Calculate total votes for percentage calculation
  const totalVotes = items.reduce((sum, item) => sum + (item.votes || 0), 0);
  items.forEach((item) => {
    item.votesPercentage = (item.votes / totalVotes) * 100;
  });
  //calculate who won the comparison
  const winner = items.reduce((max, item) => {
    return (item.votes > max.votes) ? item : max;
  }, items[0]);
  //calculate for each item - which aspect they are shining at
  items.forEach((item) => {
    item.metric_votes = [];
    comparisonMetrics.forEach((metric) => {
      const itemVotes = metric.votes.filter((vote) => vote.item_id === item.id).length;
      item.metric_votes.push({ metric_name: metric.metric_name, itemVotes: itemVotes});
    });
    item.shiningAt = item.metric_votes.sort((a, b) => b.itemVotes - a.itemVotes).slice(0, 1);
  });

  // Check if there are any clear leaders across all metrics
  let hasAnyLeader = false;
  comparisonMetrics.forEach((metric) => {
    const itemVotes = items.map(item => ({
      id: item.id,
      votes: item.metric_votes.find(vote => vote.metric_name === metric.metric_name).itemVotes
    }));
    
    const maxVotes = Math.max(...itemVotes.map(item => item.votes));
    const itemsWithMaxVotes = itemVotes.filter(item => item.votes === maxVotes);
    
    if (maxVotes > 0 && itemsWithMaxVotes.length === 1) {
      hasAnyLeader = true;
    }
  });

  //for each metric, find the item with the most votes
  comparisonMetrics.forEach((metric) => {
    const itemVotes = items.map(item => ({
      id: item.id,
      votes: item.metric_votes.find(vote => vote.metric_name === metric.metric_name).itemVotes
    }));
    
    const maxVotes = Math.max(...itemVotes.map(item => item.votes));
    const itemsWithMaxVotes = itemVotes.filter(item => item.votes === maxVotes);
    
    if (maxVotes > 0) {
      if (hasAnyLeader) {
        // If there's any leader, only show the single leader
        metric.leader = itemsWithMaxVotes.length === 1 ? itemsWithMaxVotes[0] : null;
        metric.isTied = false;
      } else {
        // If no leaders anywhere, show all items with max votes
        metric.leadingItems = itemsWithMaxVotes;
        metric.isTied = true;
      }
    } else {
      metric.leader = null;
      metric.leadingItems = [];
      metric.isTied = false;
    }
  });

  //for each item - list all the metrics they are leading or tied in
  items.forEach((item) => {
    if (hasAnyLeader) {
      item.leadingMetrics = comparisonMetrics.filter(metric => 
        metric.leader && metric.leader.id === item.id
      );
    } else {
      item.leadingMetrics = comparisonMetrics.filter(metric => 
        metric.leadingItems && metric.leadingItems.some(leadingItem => leadingItem.id === item.id)
      );
    }
  });

  console.log("items in comparison heading", items);
  console.log("local winners in comparison heading", comparisonMetrics);
  return (
    <div className="" style={{  color: currentTheme.colors.primary }}>
      {/* Poll Title */}
      <div className="comparison-grid-container">
        <div style={{  color: currentTheme.colors.text }}>
          <div className="flex justify-between items-center ">
            
            <span style={{  color: currentTheme.colors.primary, padding: '15px' }} className="text-lg font-bold text-center">
              {title || 'Untitled Comparison'}
            </span>
          </div>
        </div>
        <div className={`grid ${
          items.length === 1 ? 'grid-cols-1' :
          items.length === 2 ? 'grid-cols-2' :
          items.length === 3 ? 'grid-cols-3' :
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ml-1 mr-1 rounded-lg'
        }`} 
          style={{ 
            gap: gap,
            backgroundColor: currentTheme.colors.card
          }}
        >
          {items.map((item, i) => {
            const [error, setError] = useState(false);
            return (
              <div className="flex flex-col w-full h-full p-2 "
              style={{
                backgroundColor: 'white'
              }}
              >
            <div key={item.id} className={winner && winner.id === item.id 
            ? 'flex items-center gap-2  px-4 py-2 rounded-lg  shadow-md w-full h-full rounded-lg' 
            : 'flex items-center gap-2  px-4 py-2 shadow-md w-full h-full rounded-lg'}
            style={{
              backgroundColor: winner && winner.id !== item.id ? 
              item.item_color_string.substring(0, item.item_color_string.length - 1) + ', 0.2)' : item.item_color_string
            }}
            >
            <div className="flex flex-col items-start justify-center m-2 "
            onClick={() => {
              navigate(`/item/${item.id}`);
            }}
            >
              <div key={item.id} className="flex flex-row items-center justify-center ">
                {(!error && item.image && <img src={item.image} alt={""} className="w-10 h-10" onError={(e) => {
                  setError(true);
                }} />)}
                <div className="flex flex-col items-start justify-center">
                  <div className="flex flex-row">
                    {winner && winner.id !== item.id && (<div className="flex items-center justify-center">
                      {/* clip the following circle to be inside its container */}
                      
                       <div className="absolute align-bottom rounded-full" 
                      style={{ backgroundColor: item.item_color_string.substring(0, item.item_color_string.length - 1) + ', 0.3)',
                        width: 16* (100+2*item.votesPercentage)/40 + 'px',
                        height: 16* (100+2*item.votesPercentage)/40 + 'px',
                        zIndex: 0,
                        marginLeft: '50px',
                        marginTop: '50px'
                       }}></div>
                       <div className="absolute align-bottom rounded-full" 
                      style={{ backgroundColor: item.item_color_string.substring(0, item.item_color_string.length - 1) + ', 0.5)',
                        width: 16* (100+2*item.votesPercentage)/70 + 'px',
                        height: 16* (100+2*item.votesPercentage)/70 + 'px',
                        zIndex: 0,
                        marginLeft: '50px',
                        marginTop: '50px'
                       }}></div>
                    </div>)}
                    <h4 className="ml-2 z-10">{item.name}</h4>
                  </div>
                  <div className="flex flex-row items-center justify-center z-10">
                    <span className="text-sm text-gray-500">{item.description}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center justify-center z-10">
                <div className="flex flex-col items-start justify-center gap-2">
                  {winner && winner.id === item.id && (
                    <div className="">
                      <span className="text-base font-semibold text-green-800 dark:text-green-200">
                        🏆 Winning by {item.votesPercentage.toFixed(2)}%
                      </span>
                    </div>
                  )}
                  {/* {item.shiningAt && item.shiningAt.length > 0 && (
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                        ⭐ Best at {item.shiningAt?.map((metric) => splitAndJoin(metric.metric_name)).join(', ')}
                      </span>
                    </div>
                  )} */}
                  {item.leadingMetrics && item.leadingMetrics.length > 0 && (
                    <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg">
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-300 px-2">
                        {hasAnyLeader ? '🎯 Leading in ' : '🤝 Tied for leading in '}
                        {item.leadingMetrics?.map((metric) => 
                          splitAndJoin(metric.metric_name)
                        ).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
            </div>
          )})}
        </div>
      </div>
      
    </div>
  );
  
};

export default ComparisonHeading;