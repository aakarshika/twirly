// File: src/hooks/useVoting.js

import { useState } from 'react';

/**
 * Custom hook that manages voting functionality
 * 
 * @param {Array} initialItems - Initial array of items to vote on
 * @returns {Object} Voting state and functions
 */
const useVoting = (initialItems) => {
  const [items, setItems] = useState(initialItems);
  const [hasVoted, setHasVoted] = useState(false);
  
  /**
   * Register a vote for a specific item
   * 
   * @param {number|string} itemId - ID of the item being voted for
   * @returns {boolean} Whether the vote was registered successfully
   */
  const vote = (itemId) => {
    if (hasVoted) {
      return false; // Already voted
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, votes: item.votes + 1 } : item
      )
    );
    
    setHasVoted(true);
    return true;
  };
  
  /**
   * Get the current winner based on vote counts
   * 
   * @returns {Object|null} The winning item or null if no votes
   */
  const getWinner = () => {
    if (!hasVoted || !items.length) return null;
    
    return [...items].sort((a, b) => b.votes - a.votes)[0];
  };
  
  /**
   * Reset votes to their initial state
   */
  const resetVotes = () => {
    setItems(prevItems => 
      prevItems.map(item => ({ ...item, votes: 0 }))
    );
    setHasVoted(false);
  };
  
  return {
    items,
    setItems,
    hasVoted,
    vote,
    getWinner,
    resetVotes
  };
};

export default useVoting;