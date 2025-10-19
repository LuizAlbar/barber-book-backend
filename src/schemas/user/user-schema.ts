import { z } from 'zod';

export const signupUserSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  email: z.email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export const loginUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8, {message: "Password must be at least 8 characters long"}),
});