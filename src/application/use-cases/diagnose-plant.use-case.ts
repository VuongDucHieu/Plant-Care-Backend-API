import type { PlantAnalyzer } from '../../domain/plant-analyzer.js';
import type { DiagnosePlantResult, ImageInput } from '../../domain/plant.types.js';
import type { ImageNormalizer } from '../../domain/image-normalize.js';

import {DiagnoseError} from '../errors/diagnose-input.error.js';

export class DiagnosePlantUseCase {
  constructor(
    private readonly plantAnalyzer: PlantAnalyzer,
    private readonly imageNormalizer: ImageNormalizer
  ) { }

  async execute(images: ImageInput[]): Promise<DiagnosePlantResult> {
    if (images.length !== 2) {
      throw new DiagnoseError('Diagnose requires exactly 2 images')
    }

    const normalizedImages = await Promise.all(
      images.map((image) => this.imageNormalizer.normalize(image))
    )

    return this.plantAnalyzer.diagnose(normalizedImages)
  }
}
