import { env } from './config/env.js';

console.log({
  nodeEnv: env.NODE_ENV,
  host: env.HOST,
  port: env.PORT,
  model: env.GEMINI_MODEL,
});
