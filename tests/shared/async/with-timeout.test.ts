import { describe, expect, it } from 'vitest'

import { withTimeout } from '../../../src/shared/async/with-timeout.ts'

import { TimeoutError } from '../../../src/shared/async/timeout.error.ts'

describe('withTimeout', () => {
    it('returns the operation result when it completes before timeout', async () => {
        const operation = async () => {
            return 'success'
        }

        const result = await withTimeout(
            operation,
            1000
        )

        expect(result).toBe('success')
    })
})