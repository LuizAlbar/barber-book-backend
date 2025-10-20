import { z } from "zod";

export const createEmployeeSchema = z.object({
    email: z.email(),
    role: z.enum(["BARBEIRO", "ATENDENTE"]),
    phone_number: z.string(),
    barbershop_id: z.uuid()
})

export const updateEmployeeSchema = createEmployeeSchema.omit(
    {barbershop_id: true, email: true})
    .partial()