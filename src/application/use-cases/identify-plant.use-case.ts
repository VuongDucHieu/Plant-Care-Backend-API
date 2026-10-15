import type { PlantAnalyzer } from '../../domain/plant-analyzer.js';
import type {
  IdentifyPlantResult,
  ImageInput
} from '../../domain/plant.types.js';

import { ImageNormalizer } from '../../domain/image-normalize.js';

import { ImageInputError } from '../../domain/errors/image-input.error.js';

export class IdentifyPlantUseCase {
  constructor(
    private readonly plantAnalyzer: PlantAnalyzer,
    private readonly imageNormalizer: ImageNormalizer,
  ) { }

  async execute(images: ImageInput[]): Promise<IdentifyPlantResult> {
    if (images.length !== 1) {
      throw new ImageInputError(
        'Identify requires exactly one plant image',
        'INVALID_IMAGE',
      );
    }

    const normalizedImages = await this.imageNormalizer.normalize(images[0]!);

    return this.plantAnalyzer.identify([normalizedImages]);
  }
}
