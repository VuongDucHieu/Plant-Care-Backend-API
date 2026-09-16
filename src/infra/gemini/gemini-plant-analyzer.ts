import { GoogleGenAI, type Part } from '@google/genai';

import type { PlantAnalyzer } from '../../domain/plant-analyzer.js';
import type {
  DiagnosePlantResult,
  IdentifyPlantResult,
  ImageInput,
} from '../../domain/plant.types.js';

export class GeminiPlantAnalyzer implements PlantAnalyzer {
  private readonly client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({
      apiKey,
    });
  }

  private toImageParts(images: ImageInput[]): Part[] {
    return images.map((image) => ({
      inlineData: {
        data: image.bytes.toString('base64'),
        mimeType: image.mimeType,
      },
    }));
  }

  async identify(images: ImageInput[]): Promise<IdentifyPlantResult> {
    throw new Error('Not implement');
  }

  async diagnose(images: ImageInput[]): Promise<DiagnosePlantResult> {
    throw new Error('Not implement');
  }
}
