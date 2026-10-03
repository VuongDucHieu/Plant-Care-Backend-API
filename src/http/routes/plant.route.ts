import { Router } from 'express';
import type { Multer } from 'multer';

import type { IdentifyPlantController } from '../controllers/identify-plant.controller.js';
import type { DiagnosePlantController } from '../controllers/diagnose-plant.controller.js';

interface PlantRouterDependencies {
  identifyPlantController: IdentifyPlantController;
  diagnosePlantController: DiagnosePlantController;
  upload: Multer;
}

export function createPlantRouter({
  identifyPlantController,
  diagnosePlantController,
  upload,
}: PlantRouterDependencies): Router {
  const router = Router();

  router.post(
    '/identify',
    upload.single('image'),
    identifyPlantController.handle.bind(identifyPlantController),
  );

  router.post(
    '/diagnose',
    upload.fields([
      { name: 'plantImage', maxCount: 1 },
      { name: 'diaseaseImage', maxCount: 1 }
    ]),
    diagnosePlantController.handle.bind(diagnosePlantController),
  )

  return router;
}
