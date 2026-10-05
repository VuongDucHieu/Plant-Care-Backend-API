import type { PlantAnalyzer } from '../../domain/plant-analyzer.js';
import type {
  DiagnosePlantResult,
  ImageInput
} from '../../domain/plant.types.js';
import type { ImageNormalizer } from '../../domain/image-normalize.js';

export interface DiagnosePlantInput {
  plantImage: ImageInput;
  diseaseImage: ImageInput;
}

export class DiagnosePlantUseCase {
  constructor(
    private readonly plantAnalyzer: PlantAnalyzer,
    private readonly imageNormalizer: ImageNormalizer
  ) { }

  async execute(
    input: DiagnosePlantInput,
  ): Promise<DiagnosePlantResult> {
    const [plantImage, diseaseImage] = await Promise.all([
      this.imageNormalizer.normalize(input.plantImage),
      this.imageNormalizer.normalize(input.diseaseImage),
    ]);

    return this.plantAnalyzer.diagnose([
      plantImage,
      diseaseImage,
    ]);
  }
}
