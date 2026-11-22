
import { describe, expect, it, vi } from 'vitest';

import { IdentifyPlantUseCase } from '../../../src/application/use-cases/identify-plant.use-case.js';
import { ImageInputError } from '../../../src/domain/errors/image-input.error.js';

import type { PlantAnalyzer } from '../../../src/domain/plant-analyzer.js';
import type { ImageNormalizer } from '../../../src/domain/image-normalize.js';
import type {
    IdentifyPlantResult,
    ImageInput,
} from '../../../src/domain/plant.types.js';

describe('IdentifyPlantUseCase', () => {
    const plantImage: ImageInput = {
        bytes: Buffer.from('plant-original'),
        mimeType: 'image/jpeg',
    };

    const normalizedPlant: ImageInput = {
        bytes: Buffer.from('plant-normalized'),
        mimeType: 'image/jpeg',
    };

    const expectedResult: IdentifyPlantResult = {
        overview: {
            commonName: 'Money Tree',
            scientificName: 'Pachira aquatica',
            description: 'A tropical indoor plant',
        },
        requirements: {
            light: 'Bright indirect light',
            water: 'Water when soil is dry',
            temperature: '18-27°C',
        },
        carePlan: {
            summary: 'Maintain suitable growing conditions',
            recommendations: ['Avoid overwatering'],
        },
    };

    function createSut() {
        const normalize = vi.fn().mockResolvedValue(normalizedPlant);
        const identify = vi.fn().mockResolvedValue(expectedResult);
        const diagnose = vi.fn();

        const normalizer: ImageNormalizer = { normalize };
        const analyzer: PlantAnalyzer = { identify, diagnose };

        const useCase = new IdentifyPlantUseCase(analyzer, normalizer);

        return { useCase, normalize, identify, diagnose };
    }

    it('normalizes one image and identifies the plant', async () => {
        // Arrange
        const { useCase, normalize, identify, diagnose } = createSut();

        // Act
        const result = await useCase.execute([plantImage]);

        // Assert
        expect(normalize).toHaveBeenCalledTimes(1);
        expect(normalize).toHaveBeenCalledWith(plantImage);

        expect(identify).toHaveBeenCalledTimes(1);
        expect(identify).toHaveBeenCalledWith([normalizedPlant]);

        expect(diagnose).not.toHaveBeenCalled();
        expect(result).toEqual(expectedResult);
    });

    it.each([
        { name: 'zero images', images: [] },
        { name: 'two images', images: [plantImage, plantImage] },
    ])('rejects $name before calling dependencies', async ({ images }) => {
        // Arrange
        const { useCase, normalize, identify, diagnose } = createSut();

        // Act + Assert
        await expect(useCase.execute(images)).rejects.toMatchObject({
            name: 'ImageInputError',
            code: 'INVALID_IMAGE',
        });

        expect(normalize).not.toHaveBeenCalled();
        expect(identify).not.toHaveBeenCalled();
        expect(diagnose).not.toHaveBeenCalled();
    });
});
