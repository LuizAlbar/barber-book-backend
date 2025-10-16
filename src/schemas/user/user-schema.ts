import { z } from 'zod';

export const signupUserSchema = z.object({
  name: z.string().length(3, { message: "Name must be 3 characters long" }),
  email: z.email(),
  password: z.string().length(8, { message: "Password must be 8 characters long" }),
});

export const loginUserSchema = z.object({
  email: z.email(),
  password: z.string().length(8, {message: "Password must be 8 characters long"}),
});