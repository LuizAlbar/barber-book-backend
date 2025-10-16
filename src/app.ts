import Fastify  from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

import { signupRoute} from "./routes/auth/signup";
import { loginRoute } from "./routes/auth/login";
import { createBarbershopRoute } from "./routes/barbershop/barbershop";



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

    app.register(signupRoute);
    app.register(loginRoute);
    app.register(createBarbershopRoute);

    return app;
}