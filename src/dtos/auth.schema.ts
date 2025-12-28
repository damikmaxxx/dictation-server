import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string()
      .trim()
      .min(1, "Email is required") 
      .email("Invalid email format"),
    
    password: z.string()
      .min(6, "Password must be at least 6 characters long"),
    
    name: z.string()
      .trim()
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .trim()
      .min(1, "Email is required")
      .email("Invalid email format"),
    
    password: z.string()
      .min(1, "Password is required"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];