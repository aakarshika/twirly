/**
 * Service for handling comparison-related calculations
 */

// Calculate processed items
export const calculateProcessedItems = (items, comparisonMetrics) => {
  return calculateLeadingMetrics(
    calculateMetricVotes(
      calculateVotePercentages(items),
      comparisonMetrics
    ),
    processMetrics(
      calculateMetricVotes(
        calculateVotePercentages(items),
        comparisonMetrics
      ),
      comparisonMetrics,
      hasAnyClearLeader(
        calculateMetricVotes(
          calculateVotePercentages(items),
          comparisonMetrics
        ),
        comparisonMetrics
      )
    ),
    hasAnyClearLeader(
      calculateMetricVotes(
        calculateVotePercentages(items),
        comparisonMetrics
      ),
      comparisonMetrics
    )
  );
};




/**
 * Calculate vote percentages for each item
 * @param {Array} items - Array of comparison items
 * @returns {Array} - Items with added vote percentages
 */
export const calculateVotePercentages = (items) => {
  const totalVotes = items.reduce((sum, item) => sum + (item.votes || 0), 0);
  return items.map(item => ({
    ...item,
    votesPercentage: (item.votes / totalVotes) * 100
  }));
};

/**
 * Find the winner of the comparison
 * @param {Array} items - Array of comparison items
 * @returns {Object} - The winning item
 */
export const findWinner = (items) => {
  return items.reduce((max, item) => {
    return (item.votes > max.votes) ? item : max;
  }, items[0]);
};

/**
 * Calculate metric votes for each item
 * @param {Array} items - Array of comparison items
 * @param {Array} comparisonMetrics - Array of comparison metrics
 * @returns {Array} - Items with added metric votes
 */
export const calculateMetricVotes = (items, comparisonMetrics) => {
  return items.map(item => {
    const metric_votes = comparisonMetrics.map(metric => ({
      metric_name: metric.metric_name,
      itemVotes: metric.votes.filter(vote => vote.item_id === item.id).length
    }));
    
    const shiningAt = metric_votes
      .sort((a, b) => b.itemVotes - a.itemVotes)
      .slice(0, 1);

    return {
      ...item,
      metric_votes,
      shiningAt
    };
  });
};

/**
 * Check if there are any clear leaders across metrics
 * @param {Array} items - Array of comparison items
 * @param {Array} comparisonMetrics - Array of comparison metrics
 * @returns {boolean} - Whether there are any clear leaders
 */
export const hasAnyClearLeader = (items, comparisonMetrics) => {
  return comparisonMetrics.some(metric => {
    const itemVotes = items.map(item => ({
      id: item.id,
      votes: item.metric_votes.find(vote => vote.metric_name === metric.metric_name).itemVotes
    }));
    
    const maxVotes = Math.max(...itemVotes.map(item => item.votes));
    const itemsWithMaxVotes = itemVotes.filter(item => item.votes === maxVotes);
    
    return maxVotes > 0 && itemsWithMaxVotes.length === 1;
  });
};

/**
 * Process metrics to find leaders and ties
 * @param {Array} items - Array of comparison items
 * @param {Array} comparisonMetrics - Array of comparison metrics
 * @param {boolean} hasAnyLeader - Whether there are any clear leaders
 * @returns {Array} - Processed metrics with leader information
 */
export const processMetrics = (items, comparisonMetrics, hasAnyLeader) => {
  return comparisonMetrics.map(metric => {
    const itemVotes = items.map(item => ({
      id: item.id,
      votes: item.metric_votes.find(vote => vote.metric_name === metric.metric_name).itemVotes
    }));
    
    const maxVotes = Math.max(...itemVotes.map(item => item.votes));
    const itemsWithMaxVotes = itemVotes.filter(item => item.votes === maxVotes);
    
    if (maxVotes > 0) {
      if (hasAnyLeader) {
        return {
          ...metric,
          leader: itemsWithMaxVotes.length === 1 ? itemsWithMaxVotes[0] : null,
          isTied: false
        };
      } else {
        return {
          ...metric,
          leadingItems: itemsWithMaxVotes,
          isTied: true
        };
      }
    }
    
    return {
      ...metric,
      leader: null,
      leadingItems: [],
      isTied: false
    };
  });
};

/**
 * Calculate leading metrics for each item
 * @param {Array} items - Array of comparison items
 * @param {Array} comparisonMetrics - Array of comparison metrics
 * @param {boolean} hasAnyLeader - Whether there are any clear leaders
 * @returns {Array} - Items with added leading metrics
 */
export const calculateLeadingMetrics = (items, comparisonMetrics, hasAnyLeader) => {
  return items.map(item => ({
    ...item,
    leadingMetrics: hasAnyLeader
      ? comparisonMetrics.filter(metric => metric.leader && metric.leader.id === item.id)
      : comparisonMetrics.filter(metric => 
          metric.leadingItems && metric.leadingItems.some(leadingItem => leadingItem.id === item.id)
        )
  }));
}; 