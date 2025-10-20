import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { authHook } from '../../middlewares/auth';
import ResponseHandler from '../../utils/response-handler';

import { prisma } from '../../database/prisma-service';
import { FastifyTypedInstance } from '../../utils/types';

import { createAppointmentSchema, updateAppointmentSchema } from '../../schemas/appointment/appointment-schema';
import { ZodError } from 'zod';
import { z } from 'zod';

const idParamSchema = z.object({
    id: z.string().uuid()
});

export async function createAppointmentRoute(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.post('/appointment', {
        preHandler: authHook,
        schema: {
            tags: ['appointment'],
            description: 'Create a new appointment',
            body: createAppointmentSchema,
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        try {
            const appointmentData = createAppointmentSchema.parse(request.body);
            const userId = (request.user as any).id;

            const employee = await prisma.employee.findFirst({
                where: {
                    id: appointmentData.employee_id,
                    barbershop: {
                        user_id: userId
                    }
                }
            });

            if (!employee) {
                return ResponseHandler.error(reply, 403, 'Employee not found or does not belong to your barbershop');
            }

            const service = await prisma.service.findFirst({
                where: {
                    id: appointmentData.service_id,
                    barbershop_id: employee.barbershop_id
                }
            });

            if (!service) {
                return ResponseHandler.error(reply, 403, 'Service not found or does not belong to the same barbershop');
            }

            const appointment = await prisma.appointment.create({
                data: {
                    ...appointmentData,
                    datetime: new Date(appointmentData.datetime)
                },
                include: {
                    employee: {
                        include: {
                            user: true,
                            barbershop: true
                        }
                    },
                    service: true
                }
            });

            return ResponseHandler.createSuccess(reply, appointment.client_name, appointment.id, appointment);
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

export async function getAllAppointmentRoute(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.get('/appointment', {
        preHandler: authHook,
        schema: {
            tags: ['appointment'],
            description: 'Get all appointments',
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }
        
        try {
            const appointments = await prisma.appointment.findMany({
                where: {
                    employee: {
                        barbershop: {
                            user_id: user.id
                        }
                    }
                },
                include: {
                    employee: {
                        include: {
                            user: true,
                            barbershop: true
                        }
                    },
                    service: true
                }
            });

            if (appointments.length === 0) {
                return ResponseHandler.error(reply, 404, 'No appointments found');
            }

            return ResponseHandler.getAllSuccess(reply, 'appointment', appointments);
        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}

export async function getAppointmentById(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.get('/appointment/:id', {
        preHandler: authHook,
        schema: {
            tags: ['appointment'],
            description: 'Get appointment by ID',
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
            const appointment = await prisma.appointment.findFirst({
                where: {
                    id: id,
                    employee: {
                        barbershop: {
                            user_id: user.id
                        }
                    }
                },
                include: {
                    employee: {
                        include: {
                            user: true,
                            barbershop: true
                        }
                    },
                    service: true
                }
            });

            if (!appointment) {
                return ResponseHandler.error(reply, 404, 'Appointment not found');
            }

            return ResponseHandler.getSingleSuccess(reply, appointment.client_name, appointment.id, appointment);
        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}

export async function updateAppointment(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.put('/appointment/:id', {
        preHandler: authHook,
        schema: {
            tags: ['appointment'],
            description: 'Update appointment',
            params: idParamSchema,
            body: updateAppointmentSchema,
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }

        const { id } = request.params as { id: string };

        try {
            const appointmentData = updateAppointmentSchema.parse(request.body);

            const existingAppointment = await prisma.appointment.findFirst({
                where: {
                    id: id,
                    employee: {
                        barbershop: {
                            user_id: user.id
                        }
                    }
                }
            });

            if (!existingAppointment) {
                return ResponseHandler.error(reply, 404, 'Appointment not found');
            }

            const updateData: any = { ...appointmentData };
            if (appointmentData.datetime) {
                updateData.datetime = new Date(appointmentData.datetime);
            }

            const updatedAppointment = await prisma.appointment.update({
                where: {
                    id: id
                },
                data: updateData,
                include: {
                    employee: {
                        include: {
                            user: true,
                            barbershop: true
                        }
                    },
                    service: true
                }
            });

            return ResponseHandler.updateSuccess(reply, updatedAppointment.client_name, updatedAppointment.id, updatedAppointment);
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

export async function deleteAppointment(app: FastifyTypedInstance, options: FastifyPluginOptions) {
    app.delete('/appointment/:id', {
        preHandler: authHook,
        schema: {
            tags: ['appointment'],
            description: 'Delete appointment',
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
            const existingAppointment = await prisma.appointment.findFirst({
                where: {
                    id: id,
                    employee: {
                        barbershop: {
                            user_id: user.id
                        }
                    }
                }
            });

            if (!existingAppointment) {
                return ResponseHandler.error(reply, 404, 'Appointment not found');
            }

            await prisma.appointment.delete({
                where: {
                    id: id
                }
            });

            return ResponseHandler.deleteSuccess(reply, existingAppointment.client_name, existingAppointment.id, existingAppointment);
        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}