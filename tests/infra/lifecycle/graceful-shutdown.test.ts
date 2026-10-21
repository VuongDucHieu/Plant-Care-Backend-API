import type { Server } from 'node:http';
import { describe, expect, it, vi } from 'vitest';

import { ReadinessState } from '../../../src/infra/health/readiness-state.js';
import { createGracefulShutdown } from '../../../src/infra/lifecycle/graceful-shutdown.js';

describe('Graceful Shutdown', () => {
  // AC-03: Multiple signals must not start multiple shutdowns
  it('should execute shutdown only once when receiving multiple signals', () => {
    vi.useFakeTimers();

    try {
      const readinessState = new ReadinessState();
      readinessState.markReady();

      const close = vi.fn((_callback: (error?: Error) => void) => {
        // Giữ callback pending để mô phỏng shutdown đang diễn ra
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
        timeoutMs: 10_000,
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
  });

  // AC-04: Successful shutdown must clear the deadline timer
  it('should clear shutdown timer when server closes successfully', () => {
    vi.useFakeTimers();

    try {
      // ARRANGE
      const readinessState = new ReadinessState();
      readinessState.markReady();

      const close = vi.fn((_callback: (error?: Error) => void) => {
        // Không gọi callback ngay
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
        timeoutMs: 10_000,
      });

      // ACT: Bắt đầu shutdown
      shutdown('SIGTERM');

      expect(vi.getTimerCount()).toBe(1);
      expect(mockExit).not.toHaveBeenCalled();

      // Giả lập server.close() hoàn thành thành công
      const closeCallback = close.mock.calls[0]?.[0];

      expect(closeCallback).toBeDefined();

      closeCallback?.();

      // ASSERT: Timer đã được hủy
      expect(vi.getTimerCount()).toBe(0);

      // Shutdown thành công
      expect(mockExit).toHaveBeenCalledExactlyOnceWith(0);

      // Thử cho thời gian trôi qua 10 giây
      vi.advanceTimersByTime(10_000);

      // Không được force close hoặc exit lần nữa
      expect(closeAllConnections).not.toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledTimes(1);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});
