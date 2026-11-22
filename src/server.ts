import { createApp } from './app.js';
import { env } from './config/env.js';
import { ReadinessState } from './infra/health/readiness-state.js';
import { createGracefulShutdown } from './infra/lifecycle/graceful-shutdown.js';

const readinessState = new ReadinessState();

const app = createApp({
  readinessState,
});

const server = app.listen(env.PORT, env.HOST, () => {
  readinessState.markReady();

  console.log(`Plant Care API is running at http://${env.HOST}:${env.PORT}`);
});

const shutdown = createGracefulShutdown({
  server,
  readinessState,
  timeoutMs: 10000,
  exit: (code) => {
    process.exit(code);
  },
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
