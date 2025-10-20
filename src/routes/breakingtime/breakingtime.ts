import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { authHook } from '../../middlewares/auth';
import ResponseHandler from '../../utils/response-handler';

import { prisma } from '../../database/prisma-service';
import { FastifyTypedInstance } from '../../utils/types';

import { createBreakingTimeSchema, updateBreakingTimeSchema } from '../../schemas/breakingtime/breakingtime-schema';
import { ZodError } from 'zod';
import { z } from 'zod';

const idParamSchema = z.object({
    id: z.string().uuid()
});

export async function createBreakingTimeRoute(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.post('/breakingtime', {
        preHandler: authHook,
        schema: {
            tags: ['breakingtime'],
            description: 'Create a new breaking time',
            body: createBreakingTimeSchema,
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        try {
            const breakingTimeData = createBreakingTimeSchema.parse(request.body);
            const userId = (request.user as any).id;

            // Verificar se o schedule pertence a um employee de uma barbearia do usuário
            const schedule = await prisma.barberSchedule.findFirst({
                where: {
                    id: breakingTimeData.schedule_id,
                    employee: {
                        barbershop: {
                            user_id: userId
                        }
                    }
                }
            });

            if (!schedule) {
                return ResponseHandler.error(reply, 403, 'Schedule not found or does not belong to your barbershop');
            }

            const breakingTime = await prisma.breakingTime.create({
                data: {
                    ...breakingTimeData,
                    starting_time: new Date(`1970-01-01T${breakingTimeData.starting_time}:00.000Z`),
                    ending_time: new Date(`1970-01-01T${breakingTimeData.ending_time}:00.000Z`)
                },
                include: {
                    schedule: {
                        include: {
                            employee: {
                                include: {
                                    user: true,
                                    barbershop: true
                                }
                            }
                        }
                    }
                }
            });

            return ResponseHandler.createSuccess(reply, 'Breaking Time', breakingTime.id, breakingTime);
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

export async function getAllBreakingTimeRoute(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.get('/breakingtime', {
        preHandler: authHook,
        schema: {
            tags: ['breakingtime'],
            description: 'Get all breaking times',
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }
        
        try {
            const breakingTimes = await prisma.breakingTime.findMany({
                where: {
                    schedule: {
                        employee: {
                            barbershop: {
                                user_id: user.id
                            }
                        }
                    }
                },
                include: {
                    schedule: {
                        include: {
                            employee: {
                                include: {
                                    user: true,
                                    barbershop: true
                                }
                            }
                        }
                    }
                }
            });

            if (breakingTimes.length === 0) {
                return ResponseHandler.error(reply, 404, 'No breaking times found');
            }

            return ResponseHandler.getAllSuccess(reply, 'breakingtime', breakingTimes);
        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}

export async function getBreakingTimeById(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.get('/breakingtime/:id', {
        preHandler: authHook,
        schema: {
            tags: ['breakingtime'],
            description: 'Get breaking time by ID',
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
            const breakingTime = await prisma.breakingTime.findFirst({
                where: {
                    id: id,
                    schedule: {
                        employee: {
                            barbershop: {
                                user_id: user.id
                            }
                        }
                    }
                },
                include: {
                    schedule: {
                        include: {
                            employee: {
                                include: {
                                    user: true,
                                    barbershop: true
                                }
                            }
                        }
                    }
                }
            });

            if (!breakingTime) {
                return ResponseHandler.error(reply, 404, 'Breaking time not found');
            }

            return ResponseHandler.getSingleSuccess(reply, 'Breaking Time', breakingTime.id, breakingTime);
        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}

export async function updateBreakingTime(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.put('/breakingtime/:id', {
        preHandler: authHook,
        schema: {
            tags: ['breakingtime'],
            description: 'Update breaking time',
            params: idParamSchema,
            body: updateBreakingTimeSchema,
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }

        const { id } = request.params as { id: string };

        try {
            const breakingTimeData = updateBreakingTimeSchema.parse(request.body);

            const existingBreakingTime = await prisma.breakingTime.findFirst({
                where: {
                    id: id,
                    schedule: {
                        employee: {
                            barbershop: {
                                user_id: user.id
                            }
                        }
                    }
                }
            });

            if (!existingBreakingTime) {
                return ResponseHandler.error(reply, 404, 'Breaking time not found');
            }

            const updateData: any = { ...breakingTimeData };
            if (breakingTimeData.starting_time) {
                updateData.starting_time = new Date(`1970-01-01T${breakingTimeData.starting_time}:00.000Z`);
            }
            if (breakingTimeData.ending_time) {
                updateData.ending_time = new Date(`1970-01-01T${breakingTimeData.ending_time}:00.000Z`);
            }

            const updatedBreakingTime = await prisma.breakingTime.update({
                where: {
                    id: id
                },
                data: updateData,
                include: {
                    schedule: {
                        include: {
                            employee: {
                                include: {
                                    user: true,
                                    barbershop: true
                                }
                            }
                        }
                    }
                }
            });

            return ResponseHandler.updateSuccess(reply, 'Breaking Time', updatedBreakingTime.id, updatedBreakingTime);
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

export async function deleteBreakingTime(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.delete('/breakingtime/:id', {
        preHandler: authHook,
        schema: {
            tags: ['breakingtime'],
            description: 'Delete breaking time',
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
            const existingBreakingTime = await prisma.breakingTime.findFirst({
                where: {
                    id: id,
                    schedule: {
                        employee: {
                            barbershop: {
                                user_id: user.id
                            }
                        }
                    }
                }
            });

            if (!existingBreakingTime) {
                return ResponseHandler.error(reply, 404, 'Breaking time not found');
            }

            await prisma.breakingTime.delete({
                where: {
                    id: id
                }
            });

            return ResponseHandler.deleteSuccess(reply, 'Breaking Time', existingBreakingTime.id, existingBreakingTime);
        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}