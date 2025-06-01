# Twirly - Comparison Platform

A modern web application for creating and managing comparisons between different items, products, or concepts

## 🚀 Features

- User authentication and authorization
- Create and manage comparisons
- Vote and comment on comparisons
- Custom themes and dark mode support
- Responsive design
- Real-time updates
- User profiles and dashboards
- Feedback system

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/      # React context providers
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── services/      # API and service functions
├── styles/        # Global styles and themes
├── utils/         # Utility functions
├── lib/          # Third-party library configurations
└── assets/       # Static assets
```

## 🎨 Theming System

The application supports multiple themes:

- Light (default)
- Dark
- Sunset
- Ocean
- Forest
- Neon
- Pastel
- Retro

Each theme provides a consistent set of colors:
- `primary`: Main brand color
- `secondary`: Secondary brand color
- `background`: Page background
- `text`: Main text color
- `card`: Card background
- `border`: Border color
- `accent`: Accent color
- `muted`: Muted elements
- `hover`: Hover state color
- `focus`: Focus state color
- `disabled`: Disabled state color
- `shadow`: Shadow color

## 🔒 Authentication

The application uses a secure authentication system with:
- Email/password authentication
- Protected routes
- Session management
- User profile management

## 📱 Responsive Design

The application is fully responsive and follows these guidelines:
- Mobile-first approach
- Safe area insets for modern devices
- Consistent spacing and padding
- Flexible layouts
- Touch-friendly interactions

## 🛠️ Development Guidelines

### Component Creation

1. **Location**: Place components in appropriate directories based on their scope:
   - Shared components → `components/`
   - Page-specific components → `pages/[page-name]/components/`

2. **Structure**:
   ```jsx
   import React from 'react';
   import { useTheme } from '../contexts/ThemeContext';

   const ComponentName = ({ prop1, prop2 }) => {
     const { currentTheme } = useTheme();
     
     return (
       <div style={{ color: currentTheme.colors.text }}>
         {/* Component content */}
       </div>
     );
   };

   export default ComponentName;
   ```

### State Management

1. **Global State**: Use React Context for global state management
2. **Local State**: Use React hooks for component-level state
3. **Data Fetching**: Use service layer for API calls

### Routing

1. **Protected Routes**: Wrap sensitive routes with `ProtectedRoute` component
2. **Route Structure**: Follow the structure in `MainRoutingPage.jsx`
3. **Navigation**: Use React Router hooks for navigation

### Styling

1. **Theme Usage**:
   ```jsx
   const { currentTheme } = useTheme();
   const styles = {
     backgroundColor: currentTheme.colors.background,
     color: currentTheme.colors.text
   };
   ```

2. **Responsive Design**:
   ```jsx
   <div className="p-4 md:p-6 lg:p-8">
     {/* Content */}
   </div>
   ```

## 🧪 Testing

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test feature workflows
3. **E2E Tests**: Test complete user journeys

## 🔐 Security

1. **Authentication**: Use AuthContext for all auth needs
2. **Authorization**: Implement proper route protection
3. **Data Validation**: Validate all user inputs
4. **Error Handling**: Implement proper error boundaries

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
