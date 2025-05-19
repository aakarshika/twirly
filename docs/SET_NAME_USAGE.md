# Set Name Usage Documentation

## Database Schema
**Location**: `src/server/sql/ddl/tables/`
- Used in comparison sets table
- Stored as VARCHAR field
- Used for set identification and display

## Creation and Editing

### 1. Comparison Set Creation
**Location**: `src/server/sql/generate-controllers/create_comparison_sets.py`
- Template format: `"Category {category_id} Comparison Set {i+1}"`
- Sanitized for SQL injection
- Used in set creation queries

### 2. Sample Set Names
From `data.py`:
- "Which gaming setup would you choose for your ultimate gaming experience?"
- "Which gaming gear would complete your setup?"
- "Which audio setup would you recommend to your music-loving friend?"
- "Which coffee setup would you recommend to your caffeine-loving friend?"

## Display and UI

### 1. Progress Bar
**Location**: `src/components/aspects-progress/AspectsProgressBar.jsx`
- Displayed in header
- Truncated for display (removes last character)
- Used with "based on" text
- Styled with text-md and font-bold

### 2. Trending Card
**Location**: `src/components/common/common-cards/TrendingCard.jsx`
- Displayed as set title
- Used with metric name display
- Styled with font-medium
- Used in card header

### 3. Appearances Tab
**Location**: `src/pages/product-details/tabs/AppearancesTab.jsx`
- Displayed in set context
- Used with comment counts
- Used in set identification

## Data Structure

### 1. Set Object Structure
```javascript
{
  id: number,
  name: string,
  description: string,
  user_id: string,
  created_at: timestamp
}
```

### 2. Context Usage
**Location**: `src/contexts/useComparison.js`
- Stored in state as currentComparisonName
- Used for set identification
- Used in navigation

## UI Components

### 1. Card Display
- Used in TrendingCard
- Used in ComparisonCard
- Used in SetPreview

### 2. Header Display
- Used in progress bar
- Used in comparison view
- Used in results view

## Best Practices

### 1. Naming Conventions
- Use question format for comparison sets
- Keep names descriptive and engaging
- Include category context
- Use proper capitalization

### 2. Display Guidelines
- Truncate long names appropriately
- Maintain consistent styling
- Use proper spacing
- Consider mobile display

### 3. Data Management
- Sanitize for database storage
- Handle special characters
- Maintain uniqueness
- Track changes

## Related Features

### 1. Navigation
- Used in URLs
- Used in breadcrumbs
- Used in history

### 2. Search
- Used in search queries
- Used in filtering
- Used in sorting

### 3. Analytics
- Used in tracking
- Used in reporting
- Used in metrics

## Sample Set Categories

### 1. Gaming
- Gaming setup comparisons
- Gaming gear comparisons
- Gaming accessory comparisons

### 2. Audio
- Audio setup comparisons
- Headphone comparisons
- Speaker comparisons

### 3. Coffee
- Coffee setup comparisons
- Brewing method comparisons
- Equipment comparisons

## UI/UX Considerations

### 1. Display Length
- Handle long names gracefully
- Use truncation when needed
- Maintain readability
- Consider mobile view

### 2. Styling
- Consistent font sizes
- Proper spacing
- Clear hierarchy
- Responsive design

### 3. Interaction
- Clickable areas
- Hover states
- Focus states
- Active states

## Implementation Examples

### 1. Set Creation
```python
template = {
    "name": f"Category {category_id} Comparison Set {i+1}",
    "description": "Compare these items",
    "user_id": user_id,
    "created_at": timestamp
}
```

### 2. Set Display
```jsx
<h4>
  <span className='text-md font-bold text-center px-2 mb-2'>
    {currentSet?.name.substring(0, currentSet?.name.length - 1)}
  </span>
  <span className='text-sm'>based on</span>
</h4>
```

### 3. Set Card
```jsx
<div className="font-medium" style={{ color: currentTheme.colors.text }}>
  {set.name}
</div>
``` 