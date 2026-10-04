import { z } from 'zod'

export const diagnoseResponseSchema = z.object({
    diagnosis: z.object({
        condition: z.string(),

        severity: z.enum(['low', 'medium', 'high']),

        possibleCauses: z.array(z.string())
    }),

    treatment: z.object({
        actions: z.array(z.string()),
        notes: z.array(z.string())
    })
})