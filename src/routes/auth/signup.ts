import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { hash } from 'bcrypt';
import  ResponseHandler  from '../../utils/response-handler';

import { prisma } from '../../database/prisma-service';

import { signupUserSchema } from '../../schemas/user/user-schema';
import { ZodError } from 'zod';


export async function signupRoute(app: FastifyInstance, options: FastifyPluginOptions) {
  app.post('/signup', async (request, reply) => {
    try {
      const { name, email, password } = signupUserSchema.parse(request.body);

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return ResponseHandler.error(reply, 409, 'Email already exists', { email: 'Email already in use' });
      }

      const passwordHash = await hash(password, 12);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
        },
      });

      return ResponseHandler.createSuccess(reply, user.email, user.id, user);
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
