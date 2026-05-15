import swaggerAutogen from 'swagger-autogen';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const doc = {
  info: {
    title: 'Twirly API',
    version: '1.0.0',
    description: 'API documentation for the Twirly comparison platform',
    contact: {
      name: 'Twirly Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:8734',
      description: 'Development server',
    },
    {
      url: 'https://api.twirly.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'better-auth.session_token',
        description: 'Session cookie from Better Auth',
      },
    },
  },
};

const routes = [
  path.join(__dirname, 'src/features/health/health.routes.js'),
  path.join(__dirname, 'src/features/auth/auth.routes.js'),
  path.join(__dirname, 'src/features/trending/trending.routes.js'),
  path.join(__dirname, 'src/features/karma/karma.routes.js'),
  path.join(__dirname, 'src/features/search/search.routes.js'),
  path.join(__dirname, 'src/features/polls/polls.routes.js'),
  path.join(__dirname, 'src/features/votes/votes.routes.js'),
  path.join(__dirname, 'src/features/comments/comments.routes.js'),
  path.join(__dirname, 'src/features/comparisons/comparisons.routes.js'),
  path.join(__dirname, 'src/features/reviews/reviews.routes.js'),
  path.join(__dirname, 'src/features/items/items.routes.js'),
  path.join(__dirname, 'src/features/products/products.routes.js'),
  path.join(__dirname, 'src/features/categories/categories.routes.js'),
  path.join(__dirname, 'src/features/users/users.routes.js'),
  path.join(__dirname, 'src/features/activity/activity.routes.js'),
  path.join(__dirname, 'src/features/feedback/feedback.routes.js'),
  path.join(__dirname, 'src/features/uploads/uploads.routes.js'),
];

const outputFile = path.join(__dirname, 'swagger-output.json');

swaggerAutogen()(outputFile, routes, doc);
