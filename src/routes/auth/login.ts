import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { compare } from 'bcrypt';
import ResponseHandler from '../../utils/response-handler';

import { prisma } from '../../database/prisma-service';

import { loginUserSchema } from '../../schemas/user/user-schema';
import { ZodError } from 'zod';


export async function loginRoute(app: FastifyInstance, options: FastifyPluginOptions) {
  app.post('/login', async (request, reply) => {
    try {
      const { email, password} = loginUserSchema.parse(request.body);

      const user = await prisma.user.findUnique({where: { email }});
      if (!user) {
        return ResponseHandler.error(reply, 404, 'User not found', { email: 'User not found' });
      }
      const passwordMatch = await compare(password, user.password);

      if (!passwordMatch) {
        return ResponseHandler.error(reply, 401, 'Invalid password', { password: 'Invalid password' });
      }

      const token = app.jwt.sign({ id: user.id }, { expiresIn: '1h' });

      return ResponseHandler.success(reply, 'Login successful', { token });
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

  app.post('/login/me', async (request, reply) => {
    try {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            return ResponseHandler.error(reply, 401, 'Unauthorized', { token: 'Token not provided' });
        }

        const decoded = app.jwt.verify(token) as {id: string};
        const user = await prisma.user.findUnique({where: { id: decoded.id }});
        if (!user) {
            return ResponseHandler.error(reply, 404, 'User not found', { id: 'User not found' });
        }
        return ResponseHandler.success(reply, 'User authenticated', { user });
    }catch (error) {
        if (error instanceof ZodError) {
            const invalidFields = error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return ResponseHandler.error(reply, 400, 'Invalid fields', invalidFields);
        }
        if (error instanceof Error && error.message.includes('invalid token')) {
            return ResponseHandler.error(reply, 401, 'Invalid token', { token: 'Invalid token' });
        }
        if (error instanceof Error && error.message.includes('jwt expired')) {
            return ResponseHandler.error(reply, 401, 'Token expired', { token: 'Token expired' });
        }
        if (error instanceof Error && error.message.includes('jwt malformed')) {
            return ResponseHandler.error(reply, 401, 'Malformed token', { token: 'Malformed token' });
        }
        if (error instanceof Error && error.message.includes('jwt must be provided')) {
            return ResponseHandler.error(reply, 401, 'Token not provided', { token: 'Token not provided' });
        }
        return ResponseHandler.error(reply, 500, 'Internal Server Error');
    }
  })

  
}
