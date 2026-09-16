import { z } from 'zod';

export const identifyResponseSchema = z.object({
  overview: z.object({
    commonName: z.string(),
    scientificName: z.string(),
    description: z.string(),
  }),

  requirements: z.object({
    light: z.string(),
    water: z.string(),
    temperature: z.string(),
  }),

  carePlan: z.object({
    summary: z.string(),
    recommendations: z.array(z.string()),
  }),
});
