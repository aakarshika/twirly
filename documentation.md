# Twirly Application Documentation

## Overview
Twirly is a web application built with React and Node.js that allows users to compare items, vote on comparisons, and write reviews. The application uses Supabase as its backend database and follows a modern React architecture with context-based state management.

## Context Management

### Core Contexts

1. **ThemeContext**
   - Manages application-wide theme settings
   - Handles dark/light mode switching
   - Provides theme colors and styles to components

2. **HeaderContext**
   - Controls header visibility and behavior
   - Manages header state during scrolling
   - Coordinates with scroll-based animations

3. **ComparisonContext**
   - Manages comparison-related state
   - Handles comparison data fetching and updates
   - Coordinates voting and comparison interactions

4. **AuthContext**
   - Manages user authentication state
   - Handles login/logout functionality
   - Provides user session information

## Scroll Behavior

### PollGrid Component
- Uses Framer Motion's `useScroll` and `useTransform` for scroll-based animations
- Height changes directly proportional to scroll position
- No smoothing or spring effects for precise control
- Real-time updates during scrolling

### Scroll Implementation
```javascript
const { scrollY } = useScroll();
const heightTransform = useTransform(
  scrollY,
  [0, window.innerHeight * 0.7],
  ['100vh', '30vh'],
  { clamp: false }
);
```

## Database Schema

### Core Tables
1. **Users**
   - Stores user information (username, email, password)
   - Tracks user activity through relationships with other tables

3. **Categories**
   - Organizes items into categories
   - Used for filtering and organizing comparisons

4. **Items**
   - Core entity representing products/services
   - Contains basic information (name, description, image, price)
   - Links to categories and companies

### Comparison System
1. **Comparison Sets**
   - Groups of items being compared
   - Created by users
   - Associated with categories

2. **Comparison Set Items**
   - Links items to comparison sets
   - Many-to-many relationship between items and sets

3. **Votes**
   - Records user votes on items within comparison sets
   - Tracks voting history

### Review System
1. **Reviews**
   - User-written reviews for items
   - Contains review text and like count

2. **Review Metrics**
   - Detailed rating metrics for reviews
   - Allows for multi-dimensional rating system

3. **Review Likes**
   - Tracks which users have liked which reviews
   - Prevents duplicate likes

### Analytics
1. **Item Metrics**
   - Tracks views, comparisons, and reviews for items
   - Maintains overall rating

2. **Views**
   - `item_metric_averages`: Aggregates review metrics
   - `user_activity_summary`: Tracks user engagement

## UI Component Tree

```
App
├── Header
│   ├── Logo
│   ├── Navigation
│   │   ├── NavItem (Home)
│   │   ├── NavItem (Trending)
│   │   ├── NavItem (Profile)
│   │   └── NavItem (Settings)
│   └── UserMenu
│       ├── Avatar
│       └── DropdownMenu
├── Main Content
│   ├── Comparison Page
│   │   ├── ComparisonList
│   │   │   ├── ComparisonCard
│   │   │   │   ├── ItemCard
│   │   │   │   │   ├── ItemImage
│   │   │   │   │   ├── ItemInfo
│   │   │   │   │   └── VoteButton
│   │   │   │   └── ComparisonStats
│   │   │   └── CreateComparisonButton
│   │   └── CategoryFilter
│   ├── Trending Page
│   │   ├── TrendingList
│   │   │   └── TrendingCard
│   │   └── TimeFilter
│   ├── Profile Page
│   │   ├── UserInfo
│   │   │   ├── Avatar
│   │   │   └── UserStats
│   │   ├── ActivityTabs
│   │   │   ├── ComparisonsTab
│   │   │   ├── ReviewsTab
│   │   │   └── VotesTab
│   │   └── SettingsPanel
│   ├── Company Profile Page
│   │   ├── CompanyHeader
│   │   │   ├── CompanyLogo
│   │   │   └── CompanyInfo
│   │   ├── ProductGrid
│   │   │   └── ProductCard
│   │   └── CompanyStats
│   ├── Item Details Page
│   │   ├── ItemHeader
│   │   │   ├── ItemImage
│   │   │   └── ItemInfo
│   │   ├── ReviewSection
│   │   │   ├── ReviewList
│   │   │   │   └── ReviewCard
│   │   │   └── ReviewForm
│   │   └── ComparisonHistory
│   └── Product Details Page
│       ├── ProductGallery
│       ├── ProductInfo
│       ├── ProductSpecs
│       └── RelatedProducts
└── Footer
    ├── QuickLinks
    ├── SocialLinks
    └── Copyright
```

## UI Component Descriptions

### Layout Components

1. **Header**
   - Purpose: Main navigation and user controls
   - Components:
     - Logo: Application branding
     - Navigation: Main site navigation
     - UserMenu: User-specific actions and profile

2. **Footer**
   - Purpose: Site-wide links and information
   - Components:
     - QuickLinks: Important site sections
     - SocialLinks: Social media presence
     - Copyright: Legal information

### Comparison Components

1. **ComparisonList**
   - Purpose: Displays list of active comparisons
   - Features:
     - Pagination
     - Sorting options
     - Category filtering

2. **ComparisonCard**
   - Purpose: Individual comparison display
   - Components:
     - ItemCard: Displays item information
     - VoteButton: User voting interface
     - ComparisonStats: Voting statistics

3. **ItemCard**
   - Purpose: Displays item information
   - Features:
     - Image display
     - Basic information
     - Interactive voting

### Review Components

1. **ReviewSection**
   - Purpose: Manages item reviews
   - Components:
     - ReviewList: Displays existing reviews
     - ReviewForm: New review submission
     - ReviewMetrics: Rating statistics

2. **ReviewCard**
   - Purpose: Individual review display
   - Features:
     - User information
     - Review content
     - Like functionality
     - Rating display

### Profile Components

1. **UserInfo**
   - Purpose: Displays user profile information
   - Components:
     - Avatar: User image
     - UserStats: Activity statistics
     - Bio: User description

2. **ActivityTabs**
   - Purpose: Organizes user activity
   - Tabs:
     - Comparisons: User's comparisons
     - Reviews: User's reviews
     - Votes: User's voting history

### Company Components

1. **CompanyHeader**
   - Purpose: Company profile header
   - Components:
     - CompanyLogo: Brand image
     - CompanyInfo: Basic information
     - CompanyStats: Performance metrics

2. **ProductGrid**
   - Purpose: Displays company products
   - Features:
     - Grid layout
     - Filtering options
     - Sorting capabilities

### Product Components

1. **ProductGallery**
   - Purpose: Product image display
   - Features:
     - Image carousel
     - Zoom functionality
     - Thumbnail navigation

2. **ProductInfo**
   - Purpose: Product details display
   - Components:
     - Price display
     - Description
     - Specifications
     - Availability

### Utility Components

1. **CategoryFilter**
   - Purpose: Filters content by category
   - Features:
     - Dropdown selection
     - Multiple selection
     - Search functionality

2. **TimeFilter**
   - Purpose: Filters content by time period
   - Options:
     - Today
     - This Week
     - This Month
     - All Time

## Technical Stack

### Frontend
- React
- React Router for navigation
- Tailwind CSS for styling
- Context API for state management

### Backend
- Supabase for database and authentication
- PostgreSQL for data storage
- Real-time subscriptions for live updates

### Development Tools
- Vite for build tooling
- ESLint for code quality
- PostCSS for CSS processing
- Tailwind for utility-first CSS

## Development Guidelines

### Code Organization
- Components are organized by feature
- Services handle all API communication
- Contexts manage global state
- Pages represent main application routes

### State Management
- Use React Context for global state
- Local state for component-specific data
- Supabase real-time subscriptions for live updates

### Styling
- Tailwind CSS for styling
- Component-specific styles in component files
- Global styles in styles directory

### Database Operations
- Use Supabase client for all database operations
- Follow the established schema relationships
- Implement proper error handling

## Deployment
- Environment variables managed through `.env` files
- Supabase configuration in `SUPABASE_SETUP.md`
- Deployment instructions in `DEPLOYMENT.md` 