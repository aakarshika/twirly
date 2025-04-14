
# Poll Screen UI Documentation

## 1. Main Poll Screen (`PollScreen.jsx`)
The main poll screen is a full-page component that displays a comparison poll with voting functionality and results.

### Layout Structure:
- Full-screen height with dynamic background color
- Fixed header area (64px when visible)
- Main content area with two sections:
  1. Poll Grid (Fixed position)
  2. Results Section (Scrollable)

### Components:
1. **PollGrid** (Fixed position)
   - Title display
   - Comparison items grid
   - Voting interface

2. **Results Section** (Scrollable)
   - Bar chart visualization
   - Comments section

## 2. Poll Grid Component (`PollGrid.jsx`)
A fixed-position component that contains the main voting interface.

### Features:
- Dynamic height adjustment based on scroll position
- Smooth transitions between states
- Responsive to header visibility

### Layout:
- Fixed position at top of screen
- Height transitions from 100vh to 30vh on scroll
- Centered content with max-width of 4xl
- Contains ComparisonGrid component

## 3. Comparison Grid (`ComparisonGrid.jsx`)
The core component for displaying comparison items and handling votes.

### Layout:
- Two-column grid layout
- Dynamic gap spacing based on viewport height
- Responsive item sizing

### Components:
1. **Title Section**
   - Comparison name display
   - Font styling with theme colors

2. **Items Grid**
   - Two-column layout
   - Dynamic height calculation
   - Contains ItemCard components

## 4. Item Card (`ItemCard.jsx`)
Individual card component for each comparison item.

### Features:
- Hold-to-vote functionality
- Progress indicator
- Image display with loading states
- Vote status display

### Layout:
- Full-width card
- Dynamic height based on viewport
- Border styling with theme colors
- Contains ImageLoader component

### States:
1. **Default State**
   - Border color: theme border color
   - No progress indicator

2. **Voting State**
   - Progress indicator
   - Hold-to-vote UI
   - Progress percentage display

3. **Voted State**
   - Amber border highlight
   - Vote count display
   - "Your Vote" indicator

## 5. Image Loader (`ImageLoader.jsx`)
Handles image loading and display for comparison items.

### Features:
- Loading spinner
- Error state handling
- Image overlay with item details
- Gradient background for text

### Layout:
- Full-width and height
- Relative positioning
- Text overlay at bottom
- Loading and error states

## 6. Voting Progress (`VotingProgress.jsx`)
Progress indicator component for the voting process.

### Features:
- Progress bar animation
- Vote status indicators
- Theme-aware styling

### States:
1. **Voting Progress**
   - Progress bar fill
   - Percentage display
   - "Hold to vote" text

2. **Voted State**
   - Full progress bar
   - "Your Vote" indicator
   - Amber highlight

## 7. Results Section
Located below the poll grid, scrollable content area.

### Components:
1. **Bar Chart**
   - Visual representation of votes
   - Theme-aware styling
   - Responsive design

2. **Comments Section**
   - User comments display
   - Comment input form
   - Theme-aware styling

## Theme Integration
All components are theme-aware and use colors from the theme context:
- Background colors
- Text colors
- Border colors
- Primary colors
- Card colors

## Responsive Behavior
- Dynamic height calculations based on viewport
- Smooth transitions between states
- Mobile-friendly touch interactions
- Responsive grid layouts

## Interaction Patterns
1. **Voting**
   - Hold-to-vote mechanism
   - Progress feedback
   - Visual confirmation

2. **Scrolling**
   - Smooth transitions
   - Dynamic height adjustments
   - Header-aware positioning

3. **Loading States**
   - Spinner animations
   - Error handling
   - Image loading states
