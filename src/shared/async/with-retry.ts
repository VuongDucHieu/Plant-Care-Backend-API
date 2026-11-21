export interface RetryOptions {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    signal: AbortSignal;
    shouldRetry: (error: unknown) => boolean;
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal.aborted) {
            reject(signal.reason);

            return;
        }

        const onAbort = () => {
            clearTimeout(timer);
            reject(signal.reason);
        }

        const timer = setTimeout(() => {
            signal.removeEventListener('abort', onAbort);

            resolve()
        }, ms);

        signal.addEventListener('abort', onAbort, { once: true });
    })
}

export async function withRetry<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    options: RetryOptions,
): Promise<T> {
    const {
        maxRetries,
        baseDelayMs,
        maxDelayMs,
        signal,
        shouldRetry
    } = options;

    if (!Number.isInteger(maxRetries) || maxRetries < 0 || !Number.isFinite(baseDelayMs) || baseDelayMs <= 0 || !Number.isFinite(maxDelayMs) || maxDelayMs <= 0) {
        throw new RangeError('Invalid retry configuration');
    }

    for (let attempt = 0; ; attempt++) {
        signal.throwIfAborted();

        try {
            return await operation(signal);
        } catch (error: unknown) {
            if (signal.aborted) {
                throw error;
            }

            if (attempt >= maxRetries || !shouldRetry(error)) {
                throw error;
            }

            const exponentialDelay = Math.min(
                maxDelayMs,
                baseDelayMs * 2 ** attempt,
            );

            const delayMs = Math.random() * exponentialDelay;

            await wait(delayMs, signal);
        }
    }
}