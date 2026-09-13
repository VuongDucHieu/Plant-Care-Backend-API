import type { PlantAnalyzer } from '../../domain/plant-analyzer.js';
import type { IdentifyPlantResult, ImageInput } from '../../domain/plant.types.js';

export class IdentifyPlantUseCase {
  constructor(private readonly plantAnalyzer: PlantAnalyzer) {}

  async execute(images: ImageInput[]): Promise<IdentifyPlantResult> {
    return this.plantAnalyzer.identify(images);
  }
}
