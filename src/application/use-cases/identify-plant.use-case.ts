import type { PlantAnalyzer } from '../../domain/plant-analyzer.js';
import type { IdentifyPlantResult, ImageInput } from '../../domain/plant.types.js';

import { ImageNormalizer } from '../../domain/image-normalize.js';

import { DiagnoseError } from '../errors/diagnose-input.error.js';

export class IdentifyPlantUseCase {
  constructor(
    private readonly plantAnalyzer: PlantAnalyzer,
    private readonly imageNormalizer: ImageNormalizer,
  ) { }

  async execute(images: ImageInput[]): Promise<IdentifyPlantResult> {
    if (images.length !== 2) {
      throw new DiagnoseError('Diagnose requires exactly 2 images')
    }

    const normalizedImages = await Promise.all(
      images.map((image) => this.imageNormalizer.normalize(image)),
    );

    return this.plantAnalyzer.identify(normalizedImages);
  }
}
