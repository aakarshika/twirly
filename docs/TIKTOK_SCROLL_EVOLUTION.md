# TikTok Scroll Component Evolution

## The Problem
We needed to create a TikTok-like scrolling experience where:
1. Users can scroll through comparison sets vertically
2. Each set should load smoothly without visible loading states
3. The URL should update to reflect the current set
4. The scrolling should be continuous without any resets or jumps
5. Users can vote on items within each set
6. Vote state should be consistent across the application

## Initial Approach (Batch-Based)
The first approach used a batch-based system where:
```javascript
const BATCH_SIZE = 5;
const getBatchStartIndex = (index) => {
  return Math.floor(index / BATCH_SIZE) * BATCH_SIZE;
};
```

### Problems with Batch-Based Approach:
1. **Complex Boundary Handling**: 
   - Had to track batch boundaries and transitions
   - Required complex math to calculate batch starts and ends
   - Led to index resets at batch boundaries

2. **State Management Issues**:
   - Had to maintain multiple states: currentIndex, batchStart, lastLoadedIndex
   - These states could get out of sync, causing resets
   - Batch transitions required careful coordination
   - Vote state was duplicated between components

3. **Preloading Logic**:
   - Preloading was tied to batch boundaries
   - Could miss preloading opportunities
   - Created unnecessary complexity

## Final Approach (Sequential Loading with Centralized State)
The final solution uses a simpler sequential loading approach with centralized state management:

```javascript
// useComparisonSets.js - Centralized state management
export const useComparisonSets = (initialId) => {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastLoadedIndex, setLastLoadedIndex] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Sequential loading
  const preloadNextBatch = async () => {
    if (isPreloading.current) return;
    const nextBatchStart = lastLoadedIndex + 1;
    if (loadedBatches.current.has(nextBatchStart)) return;
    // Load next set of items
    const newItems = await fetchNextItems(nextBatchStart);
    setItems(prev => [...prev, ...newItems]);
  };

  // Centralized vote handling
  const handleVote = async (itemId) => {
    // Handle vote logic and state updates
  };

  const handleReset = async () => {
    // Handle vote reset logic and state updates
  };
};

// TikTokScroll.jsx - Clean UI component
const TikTokScroll = () => {
  const { 
    items, 
    currentIndex, 
    setCurrentIndex,
    hasVoted,
    selectedItemId,
    handleVote,
    handleReset
  } = useComparisonSets(initialId);

  // Focus on UI and scrolling behavior
};
```

### Why This Works Better:

1. **Simpler State Management**:
   - Only need to track currentIndex and lastLoadedIndex
   - No complex batch boundary calculations
   - Less chance of state getting out of sync
   - Vote state is centralized in useComparisonSets

2. **More Natural Loading**:
   - Loads items sequentially as needed
   - No artificial batch boundaries
   - Smoother user experience
   - Vote data is loaded with each set

3. **Better Preloading**:
   - Preloads based on actual loaded items
   - More predictable behavior
   - No missed preloading opportunities
   - Vote state is preloaded with items

4. **Clean Separation of Concerns**:
   - useComparisonSets handles data and state
   - TikTokScroll focuses on UI and interactions
   - Vote handling is centralized
   - No state duplication

5. **Initial Load Optimization**:
   ```javascript
   const startId = Math.max(1, initialId - 2); // Load 2 items before
   ```
   - Starts loading before the requested ID
   - Provides context for scrolling up
   - Smoother initial experience
   - Includes vote state in initial load

## Key Lessons Learned:

1. **Simplicity Over Complexity**:
   - The initial batch-based approach was over-engineered
   - The final solution is much simpler and more reliable
   - Centralized state management reduces complexity
   - Single source of truth for votes

2. **State Management**:
   - Fewer states = fewer bugs
   - Clear state transitions are crucial
   - Avoid complex state calculations
   - Keep related state together

3. **User Experience**:
   - Focus on smooth transitions
   - Preload content before it's needed
   - Handle edge cases gracefully
   - Maintain consistent vote state

4. **Performance**:
   - Load items just before they're needed
   - Keep memory usage efficient
   - Avoid unnecessary calculations
   - Efficient vote state updates

5. **Code Organization**:
   - Separate data management from UI
   - Keep related functionality together
   - Avoid state duplication
   - Clear component responsibilities

## Why It Took Multiple Iterations:

1. **Initial Assumptions**:
   - Started with a complex batch system thinking it would be more efficient
   - Overestimated the need for batch management
   - Underestimated the complexity it would add
   - Initially duplicated vote state management

2. **Learning Process**:
   - Each iteration revealed new issues
   - Had to unlearn the batch-based thinking
   - Finally arrived at the simpler solution
   - Realized the importance of centralized state

3. **Problem Understanding**:
   - Initially focused on technical implementation
   - Later realized user experience was more important
   - Final solution prioritizes smooth scrolling over technical elegance
   - Recognized the need for consistent vote state

## Conclusion:
The final solution works better because it:
1. Is simpler and more maintainable
2. Has fewer edge cases to handle
3. Provides a smoother user experience
4. Is more reliable and predictable
5. Maintains consistent vote state
6. Has clear separation of concerns

Sometimes the best solution is the simplest one, even if it takes a few iterations to realize it. The key was to centralize state management and keep related functionality together while maintaining a clean separation between data management and UI components. 