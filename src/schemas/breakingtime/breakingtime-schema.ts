import { z } from 'zod';

export const createBreakingTimeSchema = z.object({
  starting_time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Starting time must be in HH:MM format" }),
  
  ending_time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Ending time must be in HH:MM format" }),
  
  schedule_id: z.string().uuid()
});

export const updateBreakingTimeSchema = createBreakingTimeSchema.omit({ schedule_id: true }).partial();