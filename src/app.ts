import Fastify  from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

// #----- Authentication Routes -----#
import { signupRoute} from "./routes/auth/signup";
import { loginRoute } from "./routes/auth/login";

// #----- Barbershop Routes -----#
import { createBarbershopRoute } from "./routes/barbershop/barbershop";
import { getAllBarbershopRoute } from "./routes/barbershop/barbershop";
import { getBarbershopById } from "./routes/barbershop/barbershop";
import { updateBarbershop } from "./routes/barbershop/barbershop";
import { deleteBarbershop } from "./routes/barbershop/barbershop";

// #----- Employee Routes -----#
import { createEmployeeRoute } from "./routes/employee/employee";
import { getAllEmployeeRoute } from "./routes/employee/employee";
import { getEmployeeById } from "./routes/employee/employee";  
import { updateEmployee } from "./routes/employee/employee";
import { deleteEmployee } from "./routes/employee/employee";



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

    // #----- Employee Routes -----#
    app.register(createEmployeeRoute);
    app.register(getAllEmployeeRoute);
    app.register(getEmployeeById);
    app.register(updateEmployee);
    app.register(deleteEmployee);

    return app;
}