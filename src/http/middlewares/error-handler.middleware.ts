import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

import multer from "multer";

import { ImageInputError } from "../../domain/errors/image-input.error.js";
import { PlantAnalyzerError } from "../../domain/errors/plant-analyzer.error.js";

export const errorHanler: ErrorRequestHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                code: 'IMAGE_TOO_LARGE',
                message: 'Image exceeds the allowed size'
            })

            return
        }

        res.status(400).json({
            code: 'UPLOAD_ERROR',
            message: 'Invalid file upload'
        })
        return
    }

    if (error instanceof ImageInputError) {
        res.status(400).json({
            code: error.code,
            message: error.message
        })

        return
    }

    if (error instanceof PlantAnalyzerError) {
        const statusByCode = {
            RATE_LIMITED: 429,
            TIMEOUT: 504,
            UNAVAILABLE: 503,
            INVALID_RESPONSE: 503,
            UNKNOWN: 500
        } satisfies Record<PlantAnalyzerError['code'], number>

        res.status(statusByCode[error.code]).json({
            code: error.code,
            message: error.message
        })

        return
    }

    res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
    })
}