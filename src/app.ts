import express from 'express';

import { env } from './config/env.js';
import { GeminiPlantAnalyzer } from './infra/gemini/gemini-plant-analyzer.js';
import { SharpImageNormalizer } from './infra/image/sharp-image-normalizer.js';
import { IdentifyPlantUseCase } from './application/use-cases/identify-plant.use-case.js';
import { IdentifyPlantController } from './http/controllers/identify-plant.controller.js';
import { DiagnosePlantUseCase } from './application/use-cases/diagnose-plant.use-case.js';
import { DiagnosePlantController } from './http/controllers/diagnose-plant.controller.js';
import { createImageUploadMiddleware } from './http/middlewares/upload-file.middleware.js';
import { createPlantRouter } from './http/routes/plant.route.js';
import { errorHandler } from './http/middlewares/error-handler.middleware.js';

import type { PlantAnalyzer } from './domain/plant-analyzer.js';

import { createHealthRouter } from './http/routes/health.route.js';
import { ReadinessState } from './infra/health/readiness-state.js';

interface CreateAppOptions {
  plantAnalyzer?: PlantAnalyzer;
  readinessState?: ReadinessState;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();

  //1. Infrastructure
  const plantAnalyzer =
    options.plantAnalyzer ??
    new GeminiPlantAnalyzer(env.GEMINI_API_KEY, env.GEMINI_MODEL, env.GEMINI_TIMEOUT_MS);

  const imageNormalizer = new SharpImageNormalizer();

  //2. Application
  const identifyPlantUseCase = new IdentifyPlantUseCase(plantAnalyzer, imageNormalizer);
  const diagnosePlantUseCase = new DiagnosePlantUseCase(plantAnalyzer, imageNormalizer);

  //3. HTTP Controller
  const identifyPlantController = new IdentifyPlantController(identifyPlantUseCase);
  const diagnosePlantController = new DiagnosePlantController(diagnosePlantUseCase);

  //4. HTTP Middleware
  const upload = createImageUploadMiddleware(env.MAX_IMAGE_MB);

  //5. Router
  const plantRouter = createPlantRouter({
    identifyPlantController,
    diagnosePlantController,
    upload,
  });

  //6. Register routes
  const readinessState = options.readinessState ?? new ReadinessState();
  app.use('/health', createHealthRouter(readinessState));

  app.use('/plants', plantRouter);

  //7. Central error handler
  app.use(errorHandler);

  return app;
}
