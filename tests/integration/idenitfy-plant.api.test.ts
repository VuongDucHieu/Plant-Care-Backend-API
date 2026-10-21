
import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import { createApp } from '../../src/app.js';

import type { PlantAnalyzer } from '../../src/domain/plant-analyzer.js';

describe('POST /plants/identify', () => {
    it('returns 400 when image is missing', async () => {
        // Arrange
        const identify = vi.fn();
        const diagnose = vi.fn();

        const fakeAnalyzer: PlantAnalyzer = {
            identify,
            diagnose,
        };

        const app = createApp({
            plantAnalyzer: fakeAnalyzer,
        });

        // Act
        const response = await request(app)
            .post('/plants/identify');

        // Assert
        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            message: 'Plant image is required',
        });

        expect(identify).not.toHaveBeenCalled();
        expect(diagnose).not.toHaveBeenCalled();
    });
});
