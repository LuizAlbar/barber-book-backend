import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { authHook } from '../../middlewares/auth';
import ResponseHandler from '../../utils/response-handler';

import { prisma } from '../../database/prisma-service';

import { createEmployeeSchema, updateEmployeeSchema } from '../../schemas/employee/employee-schema';
import { ZodError } from 'zod';

export async function createEmployeeRoute(app: FastifyInstance, options: FastifyPluginOptions) {
    app.post('/employee', { preHandler: authHook }, async (request, reply) => {
        try {
            const employeeData = createEmployeeSchema.parse(request.body);
            const userId = (request.user as any).id;

            const barbershop = await prisma.barbershop.findFirst({
                where: {
                    id: employeeData.barbershop_id,
                    user_id: userId
                }
            });

            if (!barbershop) {
                return ResponseHandler.error(reply, 403, 'You can only add employees to your own barbershops');
            }

            
            const existingUser = await prisma.user.findUnique({
                where: { email: employeeData.email }
            });

            if (!existingUser) {
                return ResponseHandler.error(reply, 404, 'User not found', { email: 'User with this email does not exist' });
            }

            
            const existingEmployee = await prisma.employee.findUnique({
                where: { user_id: existingUser.id }
            });

            if (existingEmployee) {
                return ResponseHandler.error(reply, 409, 'User is already an employee');
            }

            const employee = await prisma.employee.create({
                data: {
                    role: employeeData.role,
                    phone_number: employeeData.phone_number,
                    user_id: existingUser.id,
                    barbershop_id: employeeData.barbershop_id
                },
                include: {
                    user: true
                }
            });

            return ResponseHandler.createSuccess(reply, employee.user.name, employee.id, employee);
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

export async function getAllEmployeeRoute(app: FastifyInstance, options: FastifyPluginOptions) {
    app.get('/employee', { preHandler: authHook }, async (request, reply) => {
        const user = request.user as {id: string};

        if (!user) {
            return ResponseHandler.error(reply, 401, 'Unauthorized');
        }
        
        try {
            const employees = await prisma.employee.findMany({
                where: {
                    barbershop: {
                        user_id: user.id
                    }
                },
                include: {
                    user: true
                }
            });

            if (employees.length === 0) {
                return ResponseHandler.error(reply, 404, 'No employees found');
            }

            return ResponseHandler.getAllSuccess(reply, 'employee', employees);
        } catch (error) {
            return ResponseHandler.error(reply, 500, 'Internal Server Error');
        }
    });
}