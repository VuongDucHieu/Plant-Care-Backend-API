import sharp from 'sharp';

import type { ImageNormalizer } from '../../domain/image-normalize.js';
import type { ImageInput } from '../../domain/plant.types.js';

import { ImageInputError } from '../../domain/errors/image-input.error.js';

export class SharpImageNormalizer implements ImageNormalizer {
  async normalize(image: ImageInput): Promise<ImageInput> {
    try {
      const source = sharp(image.bytes);

      const metadata = await source.metadata();

      if (metadata.format !== 'jpeg' && metadata.format !== 'png') {
        throw new ImageInputError('Only JPEG and PNG images are supported', 'UNSUPPORTED_FORMAT');
      }

      const bytes = await source
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
        })
        .toBuffer();

      return {
        bytes,
        mimeType: 'image/jpeg',
      };
    } catch (error: unknown) {
      if (error instanceof ImageInputError) {
        throw error;
      }

      throw new ImageInputError('Invalid or corrupted image', 'INVALID_IMAGE');
    }
  }
}
