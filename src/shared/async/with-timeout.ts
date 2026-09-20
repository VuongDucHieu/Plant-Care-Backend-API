import { TimeoutError } from './timeout.error.js';

type TimeoutOperation<T> = () => Promise<T>;

export async function withTimeout<T>(
  operation: TimeoutOperation<T>,
  timeoutMs: number,
): Promise<T> {
  const operationPromise = operation();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_resolver, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError());
    }, timeoutMs);
  });

  try {
    return await Promise.race([operationPromise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}
