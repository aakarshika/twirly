import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swaggerOutputPath = path.join(__dirname, '../../swagger-output.json');

let swaggerSpec = {};

try {
  const swaggerFile = fs.readFileSync(swaggerOutputPath, 'utf8');
  swaggerSpec = JSON.parse(swaggerFile);
} catch (err) {
  console.warn('swagger-output.json not found. Run: pnpm swagger:generate');
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Twirly API',
      version: '1.0.0',
      description: 'API documentation for the Twirly comparison platform',
    },
    paths: {},
  };
}

export { swaggerSpec };
