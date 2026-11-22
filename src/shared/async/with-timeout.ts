import { TimeoutError } from './timeout.error.js';

type TimeoutOperation<T> = (signal: AbortSignal) => Promise<T>;

export async function withTimeout<T>(
  operation: TimeoutOperation<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_resolver, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();

      reject(new TimeoutError());
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation(controller.signal), timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}
