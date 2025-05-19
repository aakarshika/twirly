# Metric Name Usage Documentation

## Database Schema
**Location**: `src/server/sql/ddl/tables/`
- Used in `comparison-aspects-schema.sql` as VARCHAR(50)
- Used in `review-schema.sql` for review metrics
- Has unique constraint with set_id in comparison aspects

## Creation and Editing

### 1. Aspect Creation (CreateComparison)
**Location**: `src/pages/user-dashboard-page/dashboard/tabs/CreateComparison.jsx`
- Initial state: `{ metric_name: '', description: '', weight: 1 }`
- Validation: Required field for new aspects
- Used in aspect form for editing
- Reset after successful creation

### 2. Aspect Form
**Location**: `src/pages/user-dashboard-page/dashboard/tabs/AspectForm.jsx`
- Displayed in font-medium style
- Editable in input field
- Used for aspect identification

## Display and UI

### 1. Progress Bar
**Location**: `src/components/aspects-progress/AspectsProgressBar.jsx`
- Displayed in progress bar items
- Used for navigation
- Special cases: 'Results' and 'Explore More'
- Length check for UI adjustments

### 2. Aspect Box
**Location**: `src/components/aspects-progress/AspectBox.jsx`
- Displayed with splitAndJoin formatting
- Length-based styling (truncation > 25 chars)
- Responsive text sizing
- Used for aspect identification

### 3. Results Display
**Location**: `src/pages/comparison-results-page/ComparisonCircle.jsx`
- Used in leading metrics display
- Formatted with splitAndJoin
- Used as key for metric mapping

## Data Processing

### 1. Comparison Service
**Location**: `src/services/comparisonService.js`
- Used in metric vote calculations
- Used for finding specific metric votes
- Used in data transformation

### 2. Reviews Service
**Location**: `src/services/reviews.js`
- Used in review metric aggregation
- Used for metric value calculations

### 3. Comparisons Service
**Location**: `src/services/comparisons.js`
- Used in aspect creation
- Used in comparison updates
- Used in data transformation

## Visualization

### 1. Bar Chart
**Location**: `src/pages/comparison-results-page/comparison-sections/BarChart.jsx`
- Used as chart title
- Used for metric identification
- Used in vote calculations
- Used as key for metric mapping

### 2. Appearances Tab
**Location**: `src/pages/product-details/tabs/AppearancesTab.jsx`
- Used in aspect name display
- Used in vote percentage calculations

## Common Patterns

### 1. Text Formatting
- Consistently uses `splitAndJoin` for display
- Handles snake_case to Title Case conversion
- Truncates long names (> 25 chars)

### 2. Data Structure
- Used as unique identifier for metrics
- Used in vote tracking
- Used in aspect relationships

### 3. UI Considerations
- Length affects layout decisions
- Used for navigation
- Used for identification
- Used in progress tracking

## Sample Metric Names
From `sample_display_items`:
- bang_for_buck
- speed_demon
- tank_like
- feature_fiesta
- user_friendliness

## Best Practices

### 1. Naming Conventions
- Use snake_case
- Keep under 50 characters
- Use descriptive names
- Avoid special characters

### 2. Display Guidelines
- Always use splitAndJoin for display
- Handle long names gracefully
- Maintain consistent formatting
- Consider mobile display

### 3. Data Management
- Validate before saving
- Handle duplicates
- Maintain relationships
- Track changes

## Related Components

### 1. Votes
- Used in vote tracking
- Used in vote calculations
- Used in vote display

### 2. Comments
- Used in comment context
- Used in comment filtering
- Used in comment display

### 3. Reviews
- Used in review metrics
- Used in review aggregation
- Used in review display 