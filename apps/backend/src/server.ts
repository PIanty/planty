import { App } from '@/app';
import { initializeOpenAI } from './utils/initializeOpenAI';
import { SubmissionRoute } from './routes/submission.route';
import { logger } from './utils/logger';
import { config } from '@repo/config-contract';

// Initialize OpenAI
export const openAIHelper = initializeOpenAI();

// Initialize the app
const app = new App([new SubmissionRoute()]);

// Start the server
app.listen();
