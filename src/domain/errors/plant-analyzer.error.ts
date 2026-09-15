import { PlantAnalyzerErrorCode } from '../plant.types.js';

export class PlantAnalyzerError extends Error {
  constructor(
    message: string,
    public readonly code: PlantAnalyzerErrorCode,
  ) {
    super(message);

    this.name = 'PlantAnalyzerError';
  }
}
