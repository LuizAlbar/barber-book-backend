import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { authHook } from '../../middlewares/auth';
import ResponseHandler from '../../utils/response-handler';

import { prisma } from '../../database/prisma-service';

import { createBarbershopSchema } from '../../schemas/barbershop/barbershop-schema';
import { ZodError } from 'zod';

export async function createBarbershopRoute(app: FastifyInstance, options: FastifyPluginOptions) {
    app.post('/barbershop', { preHandler: authHook }, async (request, reply) => {
        try {
            const barbershopData = createBarbershopSchema.parse(request.body);
            const userId = (request.user as any).id;

            const barbershop = await prisma.barbershop.create({
                data: {
                    ...barbershopData,
                    owner_id: userId
                }
            });

            return ResponseHandler.createSuccess(reply, barbershop.name, barbershop.id, barbershop);
        } catch (error) {
            if (error instanceof ZodError) {
                const invalidFields = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return ResponseHandler.error(reply, 400, 'Invalid fields', invalidFields);
            }

            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}