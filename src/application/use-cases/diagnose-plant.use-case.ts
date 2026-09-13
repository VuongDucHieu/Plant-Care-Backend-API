import type { PlantAnalyzer } from '../../domain/plant-analyzer.js';
import type { DiagnosePlantResult, ImageInput } from '../../domain/plant.types.js';

export class DiagnoseUseCase {
  constructor(private readonly plantAnalyzer: PlantAnalyzer) {}

  async execute(images: ImageInput[]): Promise<DiagnosePlantResult> {
    return this.plantAnalyzer.diagnose(images);
  }
}
