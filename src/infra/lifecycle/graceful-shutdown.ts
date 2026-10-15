import type { Server } from 'node:http';
import type { ReadinessState } from '../health/readiness-state.js'

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
    timeoutMs
}: ShutdownDependencies) {
    let isShuttingDown = false;

    return function shutdown(signal: string): void {
        if (isShuttingDown) {
            return;
        }

        isShuttingDown = true;

        console.log(`Received ${signal}. Shutting down gracefully...`);

        readinessState.markNotReady();

        const shutdownTimer = setTimeout(() => {
            console.log('Shutdown deadline exceeded!');

            server.closeAllConnections();

            exit(1);
        }, timeoutMs)

        server.close((error?: Error) => {
            clearTimeout(shutdownTimer);

            if (error) {
                console.error('Error while closing HTTP server: ', error);
                exit(1);
                return;
            }

            console.log('HTTP server closed successfully');
            exit(0)
        });
    };
}