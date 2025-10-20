import { z } from 'zod';

export const createServiceSchema = z.object({
  service_name: z
    .string()
    .min(3, { message: "Service name must be at least 3 characters long" })
    .max(100, { message: "Service name must be at most 100 characters long" }),
  
  price: z
    .number()
    .positive({ message: "Price must be positive" })
    .max(9999.99, { message: "Price must be at most 9999.99" }),
  
  time_taken: z
    .number()
    .int({ message: "Time taken must be an integer" })
    .positive({ message: "Time taken must be positive" })
    .max(480, { message: "Time taken must be at most 480 minutes (8 hours)" }),
  
  barbershop_id: z.uuid()
});

export const updateServiceSchema = createServiceSchema.omit({ barbershop_id: true }).partial();