import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});