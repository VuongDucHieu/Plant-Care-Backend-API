import { ApiError, GoogleGenAI, type Part } from '@google/genai';

import { PlantAnalyzerError } from '../../domain/errors/plant-analyzer.error.js';
import type { PlantAnalyzer } from '../../domain/plant-analyzer.js';
import type {
  DiagnosePlantResult,
  IdentifyPlantResult,
  ImageInput,
} from '../../domain/plant.types.js';

import { identifyResponseSchema } from './schemas/identify-response.schema.js';
import { identifyGeminiSchema } from './schemas/identify-gemini.schema.js';

export class GeminiPlantAnalyzer implements PlantAnalyzer {
  private readonly client: GoogleGenAI;

  private readonly identifyInstruction = `
  Analyze the provided plant image.

  Identify the plant and provide:
  - basic plant information
  - light, water, and temperature requirements
  - a concise care plant with practical recommendations
  `;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new GoogleGenAI({
      apiKey,
    });
  }

  private parseIdentifyResponse(text: string | undefined): IdentifyPlantResult {
    if (!text) {
      throw new PlantAnalyzerError('Gemini returned an empty response', 'INVALID_RESPONSE');
    }

    try {
      const raw: unknown = JSON.parse(text);

      return identifyResponseSchema.parse(raw);
    } catch {
      throw new PlantAnalyzerError('Gemini returned an invalid response', 'INVALID_RESPONSE');
    }
  }

  private toImageParts(images: ImageInput[]): Part[] {
    return images.map((image) => ({
      inlineData: {
        data: image.bytes.toString('base64'),
        mimeType: image.mimeType,
      },
    }));
  }

  private mapProviderError(error: unknown): PlantAnalyzerError {
    if (!(error instanceof ApiError)) {
      return new PlantAnalyzerError('Gemini request failed', 'UNKNOWN');
    }

    if (error.status === 429) {
      return new PlantAnalyzerError('Gemini rate limit exceeded', 'RATE_LIMITED');
    }

    if (error.status >= 500) {
      return new PlantAnalyzerError('Gemini is unavailable', 'UNAVAILABLE');
    }

    return new PlantAnalyzerError('Gemini request failed', 'UNKNOWN');
  }

  async identify(images: ImageInput[]): Promise<IdentifyPlantResult> {
    const imageParts = this.toImageParts(images);

    let response;

    try {
      response = await this.client.models.generateContent({
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
        config: {
          responseMimeType: 'application/json',
          responseSchema: identifyGeminiSchema,
        },
      });
    } catch (error: unknown) {
      throw this.mapProviderError(error);
    }

    return this.parseIdentifyResponse(response.text);
  }

  async diagnose(_images: ImageInput[]): Promise<DiagnosePlantResult> {
    throw new Error('Not implement');
  }
}
