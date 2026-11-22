import type { Server } from 'node:http';
import type { ReadinessState } from '../health/readiness-state.js';

interface ShutdownDependencies {
  server: Pick<Server, 'close' | 'closeAllConnections'>;
  readinessState: ReadinessState;
  exit: (code: number) => void;
  timeoutMs: number;
}

export function createGracefulShutdown({
  server,
  readinessState,
  exit,
  timeoutMs,
}: ShutdownDependencies) {
  let isShuttingDown = false;
  let isFinished = false;

  return function shutdown(signal: string): void {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    readinessState.markNotReady();

    console.log(`Received ${signal}. Shutting down gracefully...`);

    let shutdownTimer: ReturnType<typeof setTimeout> | undefined;

    function finish(code: number): void {
      if (isFinished) return;

      isFinished = true;

      if (shutdownTimer) {
        clearTimeout(shutdownTimer);
      }

      exit(code);
    }

    shutdownTimer = setTimeout(() => {
      console.error('Shutdown deadline exceeded');

      try {
        server.closeAllConnections();
      } catch (error) {
        console.error('Failed to force close HTTP connections:', error);
      } finally {
        finish(1);
      }
    }, timeoutMs);

    server.close((error?: Error) => {
      if (error) {
        console.error('Error closing HTTP server: ', error);
        finish(1);
        return;
      }

      console.log('HTTP server closed successfully');
      finish(0);
    });
  };
}
