import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { authHook } from '../../middlewares/auth';
import ResponseHandler from '../../utils/response-handler';

import { prisma } from '../../database/prisma-service';
import { FastifyTypedInstance } from '../../utils/types';

import { createServiceSchema, updateServiceSchema } from '../../schemas/service/service-schema';
import { ZodError } from 'zod';
import { z } from 'zod';

const idParamSchema = z.object({
    id: z.uuid()
});

export async function createServiceRoute(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.post('/service', {
        preHandler: authHook,
        schema: {
            tags: ['service'],
            description: 'Create a new service',
            body: createServiceSchema,
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        try {
            const serviceData = createServiceSchema.parse(request.body);
            const userId = (request.user as any).id;

            const barbershop = await prisma.barbershop.findFirst({
                where: {
                    id: serviceData.barbershop_id,
                    user_id: userId
                }
            });

            if (!barbershop) {
                return ResponseHandler.error(reply, 403, 'You can only add services to your own barbershops');
            }

            const service = await prisma.service.create({
                data: serviceData,
                include: {
                    barbershop: true
                }
            });

            return ResponseHandler.createSuccess(reply, service.service_name, service.id, service);
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

export async function getAllServiceRoute(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.get('/service', {
        preHandler: authHook,
        schema: {
            tags: ['service'],
            description: 'Get all services',
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }
        
        try {
            const services = await prisma.service.findMany({
                where: {
                    barbershop: {
                        user_id: user.id
                    }
                },
                include: {
                    barbershop: true
                }
            });

            if (services.length === 0) {
                return ResponseHandler.error(reply, 404, 'No services found');
            }

            return ResponseHandler.getAllSuccess(reply, 'service', services);
        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}

export async function getServiceById(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.get('/service/:id', {
        preHandler: authHook,
        schema: {
            tags: ['service'],
            description: 'Get service by ID',
            params: idParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }

        const { id } = request.params as { id: string };

        try {
            const service = await prisma.service.findFirst({
                where: {
                    id: id,
                    barbershop: {
                        user_id: user.id
                    }
                },
                include: {
                    barbershop: true
                }
            });

            if (!service) {
                return ResponseHandler.error(reply, 404, 'Service not found');
            }

            return ResponseHandler.getSingleSuccess(reply, service.service_name, service.id, service);
        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}

export async function updateService(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.put('/service/:id', {
        preHandler: authHook,
        schema: {
            tags: ['service'],
            description: 'Update service',
            params: idParamSchema,
            body: updateServiceSchema,
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }

        const { id } = request.params as { id: string };

        try {
            const serviceData = updateServiceSchema.parse(request.body);

            const existingService = await prisma.service.findFirst({
                where: {
                    id: id,
                    barbershop: {
                        user_id: user.id
                    }
                }
            });

            if (!existingService) {
                return ResponseHandler.error(reply, 404, 'Service not found');
            }

            const updatedService = await prisma.service.update({
                where: {
                    id: id
                },
                data: serviceData,
                include: {
                    barbershop: true
                }
            });

            return ResponseHandler.updateSuccess(reply, updatedService.service_name, updatedService.id, updatedService);
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

export async function deleteService(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.delete('/service/:id', {
        preHandler: authHook,
        schema: {
            tags: ['service'],
            description: 'Delete service',
            params: idParamSchema,
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }

        const { id } = request.params as { id: string };

        try {
            const existingService = await prisma.service.findFirst({
                where: {
                    id: id,
                    barbershop: {
                        user_id: user.id
                    }
                }
            });

            if (!existingService) {
                return ResponseHandler.error(reply, 404, 'Service not found');
            }

            await prisma.service.delete({
                where: {
                    id: id
                }
            });

            return ResponseHandler.deleteSuccess(reply, existingService.service_name, existingService.id, existingService);
        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}