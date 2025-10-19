import Fastify  from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

import { signupRoute} from "./routes/auth/signup";
import { loginRoute } from "./routes/auth/login";
// #----- Barbershop Routes -----#
import { createBarbershopRoute } from "./routes/barbershop/barbershop";
import { getAllBarbershopRoute } from "./routes/barbershop/barbershop";
import { getBarbershopById } from "./routes/barbershop/barbershop";
import { updateBarbershop } from "./routes/barbershop/barbershop";
import { deleteBarbershop } from "./routes/barbershop/barbershop";



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

    // #----- Authentication Routes : User -----#
    app.register(signupRoute);
    app.register(loginRoute);

    // #----- Barbershop Routes -----#
    app.register(createBarbershopRoute);
    app.register(getAllBarbershopRoute);
    app.register(getBarbershopById);
    app.register(updateBarbershop);
    app.register(deleteBarbershop);

    return app;
}