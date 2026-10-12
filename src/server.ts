import { createApp } from './app.js';
import { env } from './config/env.js';
import { ReadinessState } from './infra/health/readiness-state.js';

const readinessState = new ReadinessState();

const app = createApp({
  readinessState
});

const server = app.listen(env.PORT, env.HOST, () => {
  readinessState.markReady();

  console.log(`Plant Care API is running at http://${env.HOST}:${env.PORT}`);
});

const SHUTDOWN_TIMEOUT = 10000;

let isShuttingDown = false;

function shutdown(signal: string): void {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`Received ${signal}. Shutting down gracefully...`);

  //1. Đánh dấu instance không sẵn sàng
  readinessState.markNotReady();

  const shutdownTimer = setTimeout(() => {
    console.error('Shutdown deadline exceed');

    server.closeAllConnections();

    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  //2. Ngừng nhận kết nối mới và chờ kết nối hiện tại hoàn thành
  server.close((error?: Error) => {
    clearTimeout(shutdownTimer);

    if (error) {
      console.log('Error while closing the server:', error);
      process.exitCode = 1;
      return;
    }

    console.log('HTTP server closed successfully');

    process.exitCode = 0;
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));