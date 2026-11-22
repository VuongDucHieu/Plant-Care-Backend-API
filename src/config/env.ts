import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  HOST: z.string().min(1),
  PORT: z.coerce.number().int().positive(),

  GEMINI_API_KEY: z.string().min(1),

  GEMINI_MODEL: z.string().min(1),

  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive(),

  GEMINI_MAX_RETRIES: z.coerce.number().int().min(0),

  GEMINI_RETRY_BASE_DELAY_MS: z.coerce.number().int().positive(),

  MAX_IMAGE_MB: z.coerce.number().positive(),
  MAX_IMAGES: z.coerce.number().int().positive(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid enviroment variables:', result.error.flatten().fieldErrors);

  process.exit(1);
}

export const env = result.data;
