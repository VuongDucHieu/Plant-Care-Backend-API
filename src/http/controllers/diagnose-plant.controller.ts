import type { NextFunction, Response, Request } from 'express';

import type { DiagnosePlantUseCase } from '../../application/use-cases/diagnose-plant.use-case.js';
import type { ImageInput } from '../../domain/plant.types.js';

export class DiagnosePlantController {
    constructor(
        private readonly diagnosePlantUseCase: DiagnosePlantUseCase
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const files = req.files as Express.Multer.File[] | undefined;

            if (!files || files.length !== 2) {
                res.status(400).json({
                    message: "Exactly 2 images are required"
                })

                return;
            }

            const images: ImageInput[] = files.map((file) => ({
                bytes: file.buffer,
                mimeType: file.mimetype
            }));

            const result = await this.diagnosePlantUseCase.execute(images)

            res.status(200).json(result)
        } catch (error: unknown) {
            next(error)
        }
    }
}