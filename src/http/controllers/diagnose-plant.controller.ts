import type { NextFunction, Response, Request } from 'express';

import type { DiagnosePlantUseCase } from '../../application/use-cases/diagnose-plant.use-case.js';
import type { ImageInput } from '../../domain/plant.types.js';

type DiagnoseFiles = {
    plantImage?: Express.Multer.File[];
    diaseaseImage?: Express.Multer.File[];
}

export class DiagnosePlantController {
    constructor(
        private readonly diagnosePlantUseCase: DiagnosePlantUseCase
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const files = req.files as DiagnoseFiles | undefined;

            const plantImage = files?.plantImage?.[0];
            const diaseaseImage = files?.diaseaseImage?.[0];

            if (!plantImage || !diaseaseImage) {
                res.status(400).json({
                    message: 'plantImage and diaseaseImage are required'
                })

                return;
            }

            const plantImageInput: ImageInput = {
                bytes: plantImage.buffer,
                mimeType: plantImage.mimetype
            };

            const diaseaseImageInput: ImageInput = {
                bytes: diaseaseImage.buffer,
                mimeType: diaseaseImage.mimetype
            };

            const result = await this.diagnosePlantUseCase.execute({
                plantImage: plantImageInput,
                diaseaseImage: diaseaseImageInput
            })

            res.status(200).json(result)
        } catch (error: unknown) {
            next(error)
        }
    }
}