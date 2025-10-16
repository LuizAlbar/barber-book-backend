import { FastifyRequest, FastifyReply } from 'fastify';
import ResponseHandler from '../utils/response-handler';

export async function authHook(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return ResponseHandler.error(reply, 401, 'Invalid token');
  }
}