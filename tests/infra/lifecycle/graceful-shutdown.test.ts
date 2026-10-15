import type { Server } from 'node:http';
import { describe, expect, it, vi } from 'vitest';

import { ReadinessState } from '../../../src/infra/health/readiness-state.js';
import { createGracefulShutdown } from '../../../src/infra/lifecycle/graceful-shutdown.js';

describe('Graceful Shutdown', () => {
    it('should execute shutdown only once when receiving multiple signals', () => {
        vi.useFakeTimers();

        try {
            const readinessState = new ReadinessState();
            readinessState.markReady();

            const close = vi.fn((_callback: (error?: Error) => void) => {
                //Giữ callback pending để mô phỏng shutdown đang diễn ra
            });

            const closeAllConnections = vi.fn();
            const mockExit = vi.fn();

            const server = {
                close,
                closeAllConnections,
            } as unknown as Pick<Server, 'close' | 'closeAllConnections'>;

            const shutdown = createGracefulShutdown({
                server,
                readinessState,
                exit: mockExit,
                timeoutMs: 10000,
            });

            shutdown('SIGTERM');
            shutdown('SIGINT');
            shutdown('SIGTERM');

            expect(close).toHaveBeenCalledTimes(1);
            expect(readinessState.isReady()).toBe(false);
            expect(mockExit).not.toHaveBeenCalled();

            expect(vi.getTimerCount()).toBe(1);
        } finally {
            vi.clearAllTimers();
            vi.useRealTimers();
        }
    })
})



