import type { ImageInput } from './plant.types.js';

export interface ImageNormalizer {
  normalize(image: ImageInput): Promise<ImageInput>;
}
