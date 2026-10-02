import express from 'express';

import { env } from './config/env.js';
import { GeminiPlantAnalyzer } from './infra/gemini/gemini-plant-analyzer.js';
import { SharpImageNormalizer } from './infra/image/sharp-image-normalizer.js';
import { IdentifyPlantUseCase } from './application/use-cases/identify-plant.use-case.js';
import { IdentifyPlantController } from './http/controllers/identify-plant.controller.js';
import { createImageUploadMiddleware } from './http/middlewares/upload-file.middleware.js';
import { createPlantRouter } from './http/routes/plant.route.js';
import { errorHandler } from './http/middlewares/error-handler.middleware.js';

import type { PlantAnalyzer } from './domain/plant-analyzer.js';

interface CreateAppOptions {
    plantAnalyzer?: PlantAnalyzer
}

export function createApp(options: CreateAppOptions = {}) {
    const app = express();

    //1. Infrastructure
    const plantAnalyzer = options.plantAnalyzer ?? new GeminiPlantAnalyzer(
        env.GEMINI_API_KEY,
        env.GEMINI_MODEL,
        env.GEMINI_TIMEOUT_MS
    )

    const imageNormalizer = new SharpImageNormalizer();

    //2. Application
    const identifyPlantUseCase = new IdentifyPlantUseCase(plantAnalyzer, imageNormalizer);

    //3. HTTP Controller
    const identifyPlantController = new IdentifyPlantController(identifyPlantUseCase);

    //4. HTTP Middleware
    const upload = createImageUploadMiddleware(env.MAX_IMAGE_MB);

    //5. Router
    const plantRouter = createPlantRouter({
        identifyPlantController,
        upload,
    });

    //6. Register routes
    app.use('/plants', plantRouter);

    //7. Central error handler
    app.use(errorHandler);

    return app;
}
