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

### Additional Contexts

5. **ComparisonDraftContext**
   - Manages draft state for new comparisons
   - Handles temporary storage of comparison data
   - Coordinates with comparison creation flow

6. **FeedbackContext**
   - Manages user feedback system
   - Handles feedback submission and display
   - Coordinates with feedback modal and floating button

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

1. **Categories**
   - Primary key: id
   - Fields: name (unique), description, created_at
   - Purpose: Organizes items into categories for filtering and organization

2. **Items**
   - Primary key: id
   - Fields: name, description, image_url, category_id, price, comparison_type, created_at, updated_at
   - Foreign keys: category_id references categories(id)
   - Purpose: Core entity representing products/services that can be compared

3. **Comparison Sets**
   - Primary key: id
   - Fields: name, category_id, user_id, created_at
   - Foreign keys: category_id references categories(id), user_id references user_preferences.user_id
   - Purpose: Groups of items being compared in a poll

4. **Comparison Set Items**
   - Primary key: id
   - Fields: set_id, item_id, created_at
   - Foreign keys: set_id references comparison_sets(id), item_id references items(id)
   - Purpose: Links items to comparison sets (many-to-many relationship)

5. **Votes**
   - Primary key: id
   - Fields: user_id, item_id, set_id, created_at
   - Foreign keys: user_id references user_preferences.user_id, item_id references items(id), set_id references comparison_set-aspects(id)
   - Purpose: Records user votes on items within comparison sets

6. **Comparison Set Aspects**
   - Primary key: id
   - Fields: set_id, name, description, weight, created_at
   - Foreign keys: set_id references comparison_sets(id)
   - Purpose: Defines different aspects/criteria for comparing items within a set (e.g., price, quality, features)
   - Note: Weight field allows prioritizing certain aspects over others when calculating overall scores


9. **Comparison Set Comments**
   - Primary key: id
   - Fields: set_id, user_id, text, likes_count, dislikes_count, replies_count, is_edited, created_at, updated_at
   - Foreign keys: set_id references comparison_set_aspects(id), user_id references user_preferences.user_id
   - Purpose: Stores comments made on comparison sets

10. **Comment Replies**
    - Primary key: id
    - Fields: parent_comment_id, user_id, text, likes_count, dislikes_count, is_edited, created_at, updated_at
    - Foreign keys: parent_comment_id references comparison_set_comments(id), user_id references user_preferences.user_id
    - Purpose: Stores replies to top-level comments

11. **Comment Reactions**
    - Primary key: id
    - Fields: comment_id, reply_id, user_id, reaction_type, created_at
    - Foreign keys: comment_id references comparison_set_comments(id), reply_id references comparison_set_comment_replies(id), user_id references user_preferences.user_id
    - Constraints: reaction_type IN ('like', 'dislike')
    - Purpose: Tracks user reactions on comments and replies

12. **User Preferences**
    - Primary key: id
    - Fields: user_id, username, display_name, bio, profile_image_url, theme_preference, language_preference, is_onboarding_complete, created_at, updated_at
    - Foreign key: user_id references user_preferences.user_id
    - Unique constraint: (user_id)
    - Purpose: Stores core user preferences and settings

13. **User Notification Settings**
    - Primary key: id
    - Fields: user_id, email_notifications, push_notifications, marketing_emails, vote_notifications, comment_notifications, created_at, updated_at
    - Foreign key: user_id references user_preferences.user_id
    - Unique constraint: (user_id)
    - Purpose: Stores user notification preferences

14. **User Category Preferences**
    - Primary key: id
    - Fields: user_id, category_id, is_favorite, created_at
    - Foreign keys: user_id references user_preferences.user_id, category_id references categories(id)
    - Unique constraint: (user_id, category_id)
    - Purpose: Stores user's preferred categories

### Views

1. **item_metric_averages**
   - Purpose: Aggregates review metrics by item and metric type
   - Fields: item_id, metric_name, avg_rating, total_reviews
   - Provides average ratings and total review counts

2. **user_activity_summary**
   - Purpose: Provides comprehensive summary of user engagement
   - Fields: user_id, email, total_votes, total_reviews, total_products, total_comparisons, total_likes_received
   - Tracks user activity across all features

3. **product_performance_metrics**
   - Purpose: Provides comprehensive performance data for products
   - Fields: product_id, product_name, user_id, user_email, created_at, category_name, total_votes, total_reviews, total_comparisons
   - Includes basic product information and engagement metrics

### Performance Indexes

1. **Items Indexes**
   - idx_items_category_id
   - idx_items_user_id
   - idx_items_created_at

2. **Votes Indexes**
   - idx_votes_user_id
   - idx_votes_item_id
   - idx_votes_set_id

3. **Reviews Indexes**
   - idx_reviews_item_id
   - idx_reviews_user_id
   - idx_review_metrics_review_id
   - idx_review_likes_review_id

4. **Comments Indexes**
   - idx_comments_set_id
   - idx_comments_user_id
   - idx_replies_parent_id
   - idx_replies_user_id
   - idx_reactions_comment_id
   - idx_reactions_reply_id
   - idx_reactions_user_id

5. **User Preferences Indexes**
   - idx_user_preferences_user_id
   - idx_user_notification_settings_user_id
   - idx_user_category_preferences_user_id
   - idx_user_category_preferences_category_id

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

1. **Items Policies**
   - Anyone can view items
   - Authenticated users can create items

2. **Votes Policies**
   - Anyone can view votes
   - Authenticated users can create and update their own votes

3. **Reviews Policies**
   - Anyone can view reviews
   - Authenticated users can create and update their own reviews

4. **Review Likes Policies**
   - Anyone can view review likes
   - Authenticated users can create and delete their own review likes

5. **Comparison Sets Policies**
   - Anyone can view comparison sets
   - Authenticated users can create and update their own comparison sets

6. **Comments Policies**
   - Anyone can view comments
   - Authenticated users can create and update their own comments

7. **User Preferences Policies**
   - Users can view, update, and insert their own preferences
   - Users can manage their own notification settings
   - Users can manage their own category preferences

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

### Activity Views

1. **User Activity Views**
   - **user_weekly_activity**
     - Purpose: Tracks user activity on a weekly basis
     - Fields: date, day_name, user_id, email, activity_count, votes_count, reviews_count, comparisons_count
     - Shows daily breakdown of user activities (votes, reviews, comparisons)

   - **user_recent_activities**
     - Purpose: Shows most recent user activities
     - Fields: user_id, email, created_at, activity_type, item_id, description, hours_ago
     - Displays last 10 activities across all types

   - **user_activity_trends**
     - Purpose: Analyzes user activity trends
     - Fields: user_id, email, weekly_activity, current_week_activity, previous_week_activity, weekly_change_percentage
     - Compares current week vs previous week activity

2. **Product Activity Views**
   - **product_weekly_activity**
     - Purpose: Tracks product activity on a weekly basis
     - Fields: date, day_name, item_id, item_name, activity_count, votes_count, reviews_count, comparisons_count
     - Shows daily breakdown of product engagement

   - **product_recent_activities**
     - Purpose: Shows most recent product activities
     - Fields: item_id, item_name, created_at, activity_type, user_id, user_email, description, hours_ago
     - Displays last 10 activities for each product

   - **product_activity_trends**
     - Purpose: Analyzes product activity trends
     - Fields: item_id, item_name, weekly_activity, current_week_activity, previous_week_activity, weekly_change_percentage
     - Compares current week vs previous week product engagement

3. **Comparison Set Metrics**
   - **comparison_set_metrics**
     - Purpose: Provides detailed metrics for comparison sets
     - Fields: set_id, set_name, total_votes, total_comments, item_metrics
     - Aggregates voting and engagement statistics

### Storage Policies

1. **Profile Pictures Bucket**
   - Bucket Name: 'profile-pics'
   - Public Access: true
   - Policies:
     - **Public Access**
       - Allows anyone to view profile pictures
       - Applies to: SELECT operations
     
     - **Users can upload their own profile pictures**
       - Allows authenticated users to upload to their own folder
       - Applies to: INSERT operations
       - Folder structure: `{user_id}/filename`
     
     - **Users can update their own profile pictures**
       - Allows users to modify their own profile pictures
       - Applies to: UPDATE operations
     
     - **Users can delete their own profile pictures**
       - Allows users to remove their own profile pictures
       - Applies to: DELETE operations

2. **Security Features**
   - Row Level Security (RLS) enabled on storage.objects
   - Folder-based access control using user IDs
   - Authenticated-only operations for upload/update/delete
   - Public read access for profile pictures

## Routing Structure

### Protected Routes
- `/onboarding` - User onboarding flow
- `/search` - Search functionality
- `/` - Trending comparisons
- `/comparison/:id` - Standard comparison view
- `/new-comparison` - Create new comparison
- `/edit-comparison/:id` - Edit existing comparison
- `/item/:itemId` - Product details
- `/dashboard/*` - User dashboard and related pages
- `/settings/*` - User settings
- `/feedback` - Feedback management

### Public Routes
- `/login` - User login
- `/landing` - Landing page
- `/signup` - User registration
- `/forgot-password` - Password recovery
- `/waiting-verification` - Email verification waiting page

## Header Component
- Implements responsive design with mobile/desktop layouts
- Features:
  - Dynamic visibility based on scroll position
  - Search functionality (expandable on mobile)
  - User menu with settings drawer
  - Theme switching
  - Navigation items:
    - Trending Comparisons
    - Dashboard
    - Add New (Products/Comparisons)
    - Account Settings
  - Authentication state handling
  - Profile display with user information

## Navigation Features

### Swipe Navigation
- Implements swipe gestures for navigation
- Uses `react-swipeable` for touch/mouse interactions
- Supports:
  - Swipe right to go back
  - Smooth transitions between pages

### Scroll Behavior
- Header visibility toggles based on scroll direction
- Implements scroll threshold for header visibility
- Smooth transitions for header show/hide

## User Flow

### Authentication Flow
1. Landing Page
2. Sign Up/Login
3. Email Verification
4. Onboarding Process
   - User preferences
   - Category preferences
   - Notification settings

### Comparison Flow
1. View Trending Comparisons
2. Create New Comparison
3. Add Items to Comparison
4. Set Comparison Aspects
5. Share/View Results

### Dashboard Flow
1. User Profile Overview
2. Activity Tracking
3. Content Management
4. Settings Configuration

## Component Dependencies

### Core Dependencies
- `react-router-dom` - Routing and navigation
- `lucide-react` - Icon system
- `react-swipeable` - Touch/mouse gesture handling
- `supabase` - Backend integration

### Context Dependencies
- `ThemeContext` - Theme management
- `HeaderContext` - Header state
- `ComparisonContext` - Comparison state
- `ComparisonDraftContext` - Draft management
- `AuthContext` - Authentication state
- `FeedbackContext` - Feedback system 