import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'

import { createApp } from '../../src/app.js'
import type { PlantAnalyzer } from '../../src/domain/plant-analyzer.js'

describe('POST /plants/identify', () => {
    it('IT-IDENITFY-002: return 400 when image is missing', async () => {
        const fakeAnalyzer = {
            identify: vi.fn(),
            diagnose: vi.fn()
        } as unknown as PlantAnalyzer

        const app = createApp({
            plantAnalyzer: fakeAnalyzer
        })

        const response = await request(app).post('/plants/identify')

        expect(response.status).toBe(400)
        expect(response.body).toEqual({
            message: 'Plant image is required'
        })

        expect(fakeAnalyzer.identify).not.toHaveBeenCalled()
    })
})