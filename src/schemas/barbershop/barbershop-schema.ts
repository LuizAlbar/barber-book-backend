import { z } from 'zod';

export const createBarbershopSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" }),

  address: z
    .string()
    .min(3, { message: "Address must be at least 3 characters long" })
    .max(255, { message: "Address must be at most 255 characters long" }),

  address_number: z
    .string()
    .regex(/^\d+[A-Za-z]?$/, { message: "Address number must be numeric (e.g. 123 or 123A)" }),

  neighbourhood: z
    .string()
    .min(2, { message: "Neighbourhood must be at least 2 characters long" })
    .max(100, { message: "Neighbourhood must be at most 100 characters long" }),

  landmark: z
    .string()
    .max(100, { message: "Landmark must be at most 100 characters long" })
    .optional()
});
