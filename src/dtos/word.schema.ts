import { z } from 'zod';

export const createWordSchema = z.object({
  body: z.object({
    text: z.string().trim().min(1, "Text is required"),

    dictationId: z.number().int().min(1, "Title is required"),
    
    hint: z.string().trim().optional().nullable(),
    audioUrl: z.string().trim().optional().nullable(),
  }),
});

export const wordIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type CreateWordInput = z.infer<typeof createWordSchema>['body'];