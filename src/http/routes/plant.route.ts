import { Router } from 'express';
import type { Multer } from 'multer';

import type { IdentifyPlantController } from '../controllers/identify-plant.controller.js';

interface PlantRouterDependencies {
  identifyPlantController: IdentifyPlantController;
  upload: Multer;
}

export function createPlantRouter({
  identifyPlantController,
  upload,
}: PlantRouterDependencies): Router {
  const router = Router();

  router.post(
    '/identify',
    upload.single('image'),
    identifyPlantController.handle.bind(identifyPlantController),
  );

  return router;
}
