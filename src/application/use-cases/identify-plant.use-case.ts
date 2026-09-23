import type { PlantAnalyzer } from '../../domain/plant-analyzer.js';
import type { IdentifyPlantResult, ImageInput } from '../../domain/plant.types.js';

import { ImageNormalizer } from '../../domain/image-normalize.js';

export class IdentifyPlantUseCase {
  constructor(
    private readonly plantAnalyzer: PlantAnalyzer,
    private readonly imageNormalizer: ImageNormalizer
  ) { }

  async execute(images: ImageInput[]): Promise<IdentifyPlantResult> {
    const normalizedImages = await Promise.all(
      images.map((image) => this.imageNormalizer.normalize(image))
    )

    return this.plantAnalyzer.identify(normalizedImages);
  }
}
