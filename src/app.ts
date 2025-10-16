import Fastify  from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

export async function buildApp() {
    const app  = Fastify({
        logger: true,
    });

    await app.register(helmet);
    await app.register(cors, {
        origin: "*",
    });
    await app.register(jwt, {
        secret: process.env.JWT_SECRET || "jwt"
    });

    return app;
}