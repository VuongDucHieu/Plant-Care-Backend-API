import { GoogleGenAI, type Part } from '@google/genai';

import type { PlantAnalyzer } from '../../domain/plant-analyzer.js';
import type {
  DiagnosePlantResult,
  IdentifyPlantResult,
  ImageInput,
} from '../../domain/plant.types.js';
import { identifyResponseSchema } from './schemas/identify-response.schema.js';

export class GeminiPlantAnalyzer implements PlantAnalyzer {
  private readonly client: GoogleGenAI;

  private readonly identifyInstruction = `
  Analyze the provided plant image.

  Return the result as JSON containing:
  - commonName
  - scientificName
  - description 
  `;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
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
    const imageParts = this.toImageParts(images);

    const response = await this.client.models.generateContent({
      model: this.model,

      contents: [
        {
          role: 'user',
          parts: [
            {
              text: this.identifyInstruction,
            },
            ...imageParts,
          ],
        },
      ],
    });

    // console.log(response.text);

    // throw new Error('Response mapping not implemented');

    const text = response.text;

    if (!text) {
      throw new Error('Gemini returned an empty response');
    }

    const raw: unknown = JSON.parse(text);

    return identifyResponseSchema.parse(raw);
  }

  async diagnose(images: ImageInput[]): Promise<DiagnosePlantResult> {
    throw new Error('Not implement');
  }
}
