import { describe, expect, it } from 'vitest';

import { TimeoutError } from '../../../src/shared/async/timeout.error.ts';
import { withTimeout } from '../../../src/shared/async/with-timeout.ts';

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
});
