import type { NextFunction, Response, Request } from 'express';

import type { DiagnosePlantUseCase } from '../../application/use-cases/diagnose-plant.use-case.js';
import type { ImageInput } from '../../domain/plant.types.js';

type DiagnoseFiles = {
    plantImage?: Express.Multer.File[];
    diseaseImage?: Express.Multer.File[];
}

export class DiagnosePlantController {
    constructor(
        private readonly diagnosePlantUseCase: DiagnosePlantUseCase
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const files = req.files as DiagnoseFiles | undefined;

            const plantImage = files?.plantImage?.[0];
            const diseaseImage = files?.diseaseImage?.[0];

            if (!plantImage || !diseaseImage) {
                res.status(400).json({
                    message: 'plantImage and diseaseImage are required'
                })

                return;
            }

            const plantImageInput: ImageInput = {
                bytes: plantImage.buffer,
                mimeType: plantImage.mimetype
            };

            const diseaseImageInput: ImageInput = {
                bytes: diseaseImage.buffer,
                mimeType: diseaseImage.mimetype
            };

            const result = await this.diagnosePlantUseCase.execute({
                plantImage: plantImageInput,
                diseaseImage: diseaseImageInput
            })

            res.status(200).json(result)
        } catch (error: unknown) {
            next(error)
        }
    }
}