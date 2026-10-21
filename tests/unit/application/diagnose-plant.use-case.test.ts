import { describe, expect, it, vi } from 'vitest';

import { DiagnosePlantUseCase } from '../../../src/application/use-cases/diagnose-plant.use-case';

import type { PlantAnalyzer } from '../../../src/domain/plant-analyzer';
import type { ImageNormalizer } from '../../../src/domain/image-normalize';
import type {
    DiagnosePlantResult,
    ImageInput
} from '../../../src/domain/plant.types.ts';

describe('DiagnosePlantUseCase', () => {
    it('normalizes both images and diagnoses them in the correct order', async () => {
        //Arrange: create two distinct input images
        const plantImage: ImageInput = {
            bytes: Buffer.from('plant-original'),
            mimeType: 'image/jpg',
        };

        const diseaseImage: ImageInput = {
            bytes: Buffer.from('disease-original'),
            mimeType: 'image/jpg',
        };

        //Arrange: fake normalized images
        const normalizedPlant: ImageInput = {
            bytes: Buffer.from('plant-normalized'),
            mimeType: 'image/jpg',
        };

        const normalizedDisease: ImageInput = {
            bytes: Buffer.from('disease-normalized'),
            mimeType: 'image/jpg',
        };

        const expectedResult: DiagnosePlantResult = {
            plant: {
                commonName: 'Money Tree',
                scientificName: 'Pachira aquatica',
            },
            diagnosis: {
                condition: 'Possible overwatering',
                severity: 'medium',
                possibleCauses: ['Excess water'],
            },
            treatment: {
                actions: ['Check soil moisture'],
                notes: ['Monitor yellow leaves'],
            },
        };

        //Arrange: mock external dependencies
        const normalize = vi.fn(async (image: ImageInput) => {
            if (image === plantImage) return normalizedPlant;
            if (image === diseaseImage) return normalizedDisease;

            throw new Error('Unexpected image');
        });

        const diagnose = vi.fn().mockResolvedValue(expectedResult);
        const identify = vi.fn();

        const imageNormalizer: ImageNormalizer = {
            normalize,
        };

        const plantAnalyzer: PlantAnalyzer = {
            identify,
            diagnose,
        };

        const useCase = new DiagnosePlantUseCase(
            plantAnalyzer,
            imageNormalizer,
        );

        // Act: execute the business operation
        const result = await useCase.execute({
            plantImage,
            diseaseImage,
        });

        // Assert: normalization happens for both inputs
        expect(normalize).toHaveBeenCalledTimes(2);
        expect(normalize).toHaveBeenCalledWith(plantImage);
        expect(normalize).toHaveBeenCalledWith(diseaseImage);

        // Assert: one analyzer call, correct image order
        expect(diagnose).toHaveBeenCalledTimes(1);
        expect(diagnose).toHaveBeenCalledWith([
            normalizedPlant,
            normalizedDisease,
        ]);

        // Assert: Identify must not be called
        expect(identify).not.toHaveBeenCalled();

        // Assert: return analyzer result
        expect(result).toEqual(expectedResult);
    });
});