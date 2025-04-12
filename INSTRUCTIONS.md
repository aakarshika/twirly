# COMPARE - Installation and Usage Instructions

This document provides detailed instructions on how to set up, configure, and deploy the COMPARE application.

## Prerequisites

Before getting started, ensure you have the following installed:

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher) or yarn (v1.22.0 or higher)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/compare-app.git
cd compare-app
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

## Development

### Start Development Server

```bash
npm run dev
# or
yarn dev
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

### Linting

To check for code quality issues:

```bash
npm run lint
# or
yarn lint
```

### Testing

Run tests:

```bash
npm run test
# or
yarn test
```

Run tests in watch mode:

```bash
npm run test:watch
# or
yarn test:watch
```

## Project Structure

The application follows a modular structure:

```
src/
├── assets/               # Static assets
├── components/           # UI components
│   ├── common/           # Generic components
│   ├── layout/           # Layout components
│   └── comparison/       # Feature-specific components
├── contexts/             # React context providers
├── data/                 # Data files
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── pages/                # Page components
├── styles/               # Global styles
├── App.jsx               # Main App component
└── index.jsx             # Entry point
```

## Customization

### Adding New Item Sets

To add new item sets for comparison, modify the `src/data/itemSets.js` file:

```javascript
// Add a new set to the initialItemSets array
[
  { 
    id: 13, 
    name: "Item 1", 
    image: "/api/placeholder/300/300", 
    description: "Description for Item 1", 
    category: "Your Category",
    votes: 0,
    reviews: [],
    metrics: { 
      metric1: 0, 
      metric2: 0, 
      metric3: 0, 
      metric4: 0 
    } 
  },
  // Add more items...
]
```

### Customizing Metrics

To add new metric types for different categories, update the `getDefaultMetrics` function in `src/data/itemSets.js`:

```javascript
export const getDefaultMetrics = (category) => {
  switch (category.toLowerCase()) {
    // Add your custom category and metrics
    case 'your category':
      return { metric1: 0, metric2: 0, metric3: 0, metric4: 0 };
    default:
      return { quality: 0, value: 0, design: 0, satisfaction: 0 };
  }
};
```

### Styling

The application uses Tailwind CSS for styling. To customize the design:

1. Modify the `tailwind.config.js` file to update colors, fonts, etc.
2. Add custom utility classes in `src/styles/globals.css`

## Building for Production

Create a production build:

```bash
npm run build
# or
yarn build
```

Preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## Deployment

### Static Hosting (Netlify, Vercel, etc.)

1. Create a production build:

```bash
npm run build
```

2. Deploy the `dist` directory to your hosting provider.

### With Netlify

If using Netlify, you can set up continuous deployment:

1. Push your code to GitHub, GitLab, or Bitbucket
2. Connect your repository in Netlify
3. Set build command to `npm run build`
4. Set publish directory to `dist`

## Troubleshooting

### Common Issues

#### "Module not found" errors

Make sure all dependencies are installed:

```bash
npm install
```

#### Style issues

If styles aren't applying correctly, try clearing your browser cache or rebuilding:

```bash
npm run build
```

#### Performance issues

If you encounter performance problems, check for unnecessary re-renders in your React components using the React DevTools profiler.

## Support and Feedback

For support or feedback, please open an issue in the GitHub repository.