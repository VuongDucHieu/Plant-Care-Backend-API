import { describe, expect, it } from 'vitest';

import { TimeoutError } from '../../../src/shared/async/timeout.error.js';
import { withTimeout } from '../../../src/shared/async/with-timeout.js';

describe('withTimeout', () => {
  it('returns the operation result when it completes before timeout', async () => {
    const operation = async () => {
      return 'success';
    };

    const result = await withTimeout(operation, 1000);

    expect(result).toBe('success');
  });

  it('throws TimeoutError when operation exceeds timeout', async () => {
    const operation = async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      return 'success';
    };

    await expect(withTimeout(operation, 10)).rejects.toBeInstanceOf(TimeoutError);
  });

  it('aborts the operation when timeout is exceeded', async () => {
    let receivedSignal: AbortSignal | undefined;

    const operation = async (signal: AbortSignal) => {
      receivedSignal = signal;

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      return 'success';
    };

    await expect(withTimeout(operation, 10)).rejects.toBeInstanceOf(TimeoutError);

    expect(receivedSignal?.aborted).toBe(true);
  });
});