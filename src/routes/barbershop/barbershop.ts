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
                    user_id: userId
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

export async function getAllBarbershopRoute(app: FastifyInstance, options: FastifyPluginOptions) {
    app.get('/barbershop', { preHandler : authHook }, async (request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }
        
        try {
            const barbershops = await prisma.barbershop.findMany({
                where: {
                    user_id: user.id
                }
            });

            if (barbershops.length === 0 ) {
                return ResponseHandler.error(reply, 404, 'No barbershop found');
            }

            return ResponseHandler.getAllSuccess(reply, 'barbershop', barbershops)
        } catch (error) {
            console.error('Error retrieving barbershops:', error);
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    })
}

export async function getBarbershopById(app: FastifyInstance, options: FastifyPluginOptions) {
    app.get('/barbershop/:id', { preHandler : authHook }, async(request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }
        const { id } = request.params as { id : string };

        try {
            const barbershop = await prisma.barbershop.findFirst({
                where : {
                    id: id,
                    user_id: user.id
                }
            })

            if (!barbershop) {
                return ResponseHandler.error(reply, 404, 'Barbershop not found');
            }

            return ResponseHandler.getSingleSuccess(reply, barbershop.name, barbershop.id, barbershop)

        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    })
    
}