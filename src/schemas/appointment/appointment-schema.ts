import { z } from 'zod';

export const createAppointmentSchema = z.object({
  client_name: z
    .string()
    .min(2, { message: "Client name must be at least 2 characters long" })
    .max(100, { message: "Client name must be at most 100 characters long" }),
  
  client_contact: z
    .string()
    .min(10, { message: "Client contact must be at least 10 characters long" })
    .max(20, { message: "Client contact must be at most 20 characters long" }),
  
  datetime: z
    .string()
    .datetime({ message: "Invalid datetime format" }),
  
  employee_id: z.uuid(),
  service_id: z.uuid()
});

export const updateAppointmentSchema = z.object({
  client_name: z
    .string()
    .min(2, { message: "Client name must be at least 2 characters long" })
    .max(100, { message: "Client name must be at most 100 characters long" })
    .optional(),
  
  client_contact: z
    .string()
    .min(10, { message: "Client contact must be at least 10 characters long" })
    .max(20, { message: "Client contact must be at most 20 characters long" })
    .optional(),
  
  datetime: z
    .string()
    .datetime({ message: "Invalid datetime format" })
    .optional(),
  
  status: z.enum(["PENDENTE", "COMPLETO", "CANCELADO"]).optional()
});