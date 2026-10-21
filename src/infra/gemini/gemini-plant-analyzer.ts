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

import { diagnoseResponseSchema } from './schemas/diagnose-response.schema.js';
import { diagnoseGeminiSchema } from './schemas/diagnose-gemini.schema.js';

import { withTimeout } from '../../shared/async/with-timeout.js';

import { TimeoutError } from '../../shared/async/timeout.error.js';

export class GeminiPlantAnalyzer implements PlantAnalyzer {
  private readonly client: GoogleGenAI;

  private readonly identifyInstruction = `
  Analyze the provided plant image.

  Identify the plant and provide:
  - basic plant information
  - light, water, and temperature requirements
  - a concise care plan with practical recommendations
  `;

  private readonly diagnoseInstruction = `
    You are a plant identification and plant health analysis assistant.

    You will receive exactly TWO images in the following order:

    IMAGE 1 - PLANT IDENTIFICATION:
    - This is an overview image of the plant.
    - Identify the most likely plant species.
    - Provide its common name and scientific name.
    - Do not use the second image as the primary source for plant identification.

    IMAGE 2 - DISEASE ANALYSIS:
    - This image shows the area suspected of having a disease, pets problem, or other abnormality.
    - Examine visible symptoms such as discoloration, spots, damage, wilting, or unusual growth.
    - Use the plant identified from Image 1 as context.
    - Determine the most likely condition based on the visual evidence from Image 2.

    DIAGNOSIS:
    - Identify the most likely condition.
    - Classify severity as low, medium, or high.
    - Provide plausible causes supported by the images.
    - Recommend practical and safe treatment actions.
    - Include useful monitoring and prevention notes.

    IMPORTANT RULES:
    - Analyze both images together in ONE analysis.
    - Do not assume that every abnormality is a disease.
    - Consider environmental stress, pests, and
      nutrient deficiencies where appropriate.
    - Do not invent symptoms that are not visible.
    - Do not claim certainty when evidence is insufficient.
    - If identification is uncertain, clearly indicate
      uncertainty in the returned text fields.
    - Do not recommend hazardous pesticide mixtures
      or unsupported chemical treatments.

    Return a JSON object matching the provided
    response schema with these top-level fields:
    - plant
    - diagnosis
    - treatment
  `;

  constructor(
    apiKey: string,
    private readonly model: string,
    private readonly timeoutMs: number,
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

  private parseDiagnoseResponse(text: string | undefined): DiagnosePlantResult {
    if (!text) {
      throw new PlantAnalyzerError('Gemini returned an empty response', 'INVALID_RESPONSE');
    }

    try {
      const raw: unknown = JSON.parse(text);

      return diagnoseResponseSchema.parse(raw);
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
    if (error instanceof TimeoutError) {
      return new PlantAnalyzerError('Gemini request timeout', 'TIMEOUT');
    }

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
      response = await withTimeout(
        (signal) =>
          this.client.models.generateContent({
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

              abortSignal: signal,
            },
          }),
        this.timeoutMs,
      );
    } catch (error: unknown) {
      throw this.mapProviderError(error);
    }

    return this.parseIdentifyResponse(response.text);
  }

  async diagnose(images: ImageInput[]): Promise<DiagnosePlantResult> {
    const imageParts = this.toImageParts(images);

    let response;

    try {
      response = await withTimeout(
        (signal) =>
          this.client.models.generateContent({
            model: this.model,

            contents: [
              {
                role: 'user',

                parts: [
                  {
                    text: this.diagnoseInstruction,
                  },

                  ...imageParts,
                ],
              },
            ],

            config: {
              responseMimeType: 'application/json',
              responseSchema: diagnoseGeminiSchema,

              abortSignal: signal,
            },
          }),

        this.timeoutMs,
      );
    } catch (error: unknown) {
      throw this.mapProviderError(error);
    }

    return this.parseDiagnoseResponse(response.text);
  }
}
