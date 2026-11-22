import type { NextFunction, Request, Response } from 'express';

import type { IdentifyPlantUseCase } from '../../application/use-cases/identify-plant.use-case.js';
import type { ImageInput } from '../../domain/plant.types.js';

export class IdentifyPlantController {
  constructor(private readonly identifyPlantUseCase: IdentifyPlantUseCase) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          message: 'Plant image is required',
        });

        return;
      }

      const image: ImageInput = {
        bytes: req.file.buffer,
        mimeType: req.file.mimetype,
      };

      const result = await this.identifyPlantUseCase.execute([image]);

      res.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  }
}
