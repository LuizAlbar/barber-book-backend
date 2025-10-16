import Fastify  from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";

export async function buildApp() {
    const app  = Fastify({
        logger: true,
    });

    await app.register(helmet);
    await app.register(cors, {
        origin: "*",
    });

    return app;
}