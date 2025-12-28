import { z } from 'zod';

const WordItemSchema = z.object({
  text: z.string()
    .trim()
    .min(1, "Text is required"), 

  hint: z.string()
    .trim()
    .optional()
    .nullable(), 

  audioUrl: z.string()
    .trim()
    .optional()
    .nullable(),
});

const WordErrorSchema = z.object({
  word: z.string(),
  userInput: z.string(),
  isCorrect: z.boolean().optional(),
});


export const createDictationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required"),
    language: z.string().default('ru'),
    description: z.string().trim().optional(),
    isPublic: z.boolean().optional().default(false), 
    
    words: z.array(WordItemSchema).min(1, "At least one word is required"),
  }),
});

export const updateDictationSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().trim().min(1).optional(),
    language: z.string().optional(),
    description: z.string().trim().optional(),
    isPublic: z.boolean().optional(), 
    
    words: z.array(WordItemSchema).optional(), 
  }),
});

export const dictationIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const completeDictationSchema = z.object({
  body: z.object({
    dictationId: z.number(),

    score: z.number().min(0).max(100),

    totalWords: z.number().int().min(1),

    correctCount: z.number().int().min(0),

    errors: z.array(WordErrorSchema).optional().default([]),
  }),
});


export type CreateDictationInput = z.infer<typeof createDictationSchema>['body'];
export type UpdateDictationInput = z.infer<typeof updateDictationSchema>['body'];
export type CompleteDictationInput = z.infer<typeof completeDictationSchema>['body'];
export type WordItemDto = z.infer<typeof WordItemSchema>;