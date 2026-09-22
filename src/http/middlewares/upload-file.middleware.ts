import multer from 'multer';

export function createImageUploadMiddleware(maxImageMb: number) {
  return multer({
    storage: multer.memoryStorage(),

    limits: {
      fileSize: maxImageMb * 1024 * 1024,
    },
  });
}
