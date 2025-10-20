import { fastify } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";

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

// #----- Service Routes -----#
import { createServiceRoute } from "./routes/service/service";
import { getAllServiceRoute } from "./routes/service/service";
import { getServiceById } from "./routes/service/service";
import { updateService } from "./routes/service/service";
import { deleteService } from "./routes/service/service";

// #----- Appointment Routes -----#
import { createAppointmentRoute } from "./routes/appointment/appointment";
import { getAllAppointmentRoute } from "./routes/appointment/appointment";
import { getAppointmentById } from "./routes/appointment/appointment";
import { updateAppointment } from "./routes/appointment/appointment";
import { deleteAppointment } from "./routes/appointment/appointment";

// #----- BreakingTime Routes -----#
import { createBreakingTimeRoute } from "./routes/breakingtime/breakingtime";
import { getAllBreakingTimeRoute } from "./routes/breakingtime/breakingtime";
import { getBreakingTimeById } from "./routes/breakingtime/breakingtime";
import { updateBreakingTime } from "./routes/breakingtime/breakingtime";
import { deleteBreakingTime } from "./routes/breakingtime/breakingtime";




export async function buildApp() {
    const app  = fastify({
        logger: true,
    }).withTypeProvider<ZodTypeProvider>();

    await app.register(helmet);
    await app.register(cors, {
        origin: "*",
    });
    await app.register(jwt, {
        secret: process.env.JWT_SECRET || "jwt"
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(fastifySwagger, {
        openapi: {
            info: {
                title: "BarberShop API",
                description: "BarberShop API",
                version: "0.1.0"
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        },
        transform: jsonSchemaTransform
    })

    app.register(fastifySwaggerUi, {
        routePrefix: "/docs"
    })

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

    // #----- Service Routes -----#
    app.register(createServiceRoute);
    app.register(getAllServiceRoute);
    app.register(getServiceById);
    app.register(updateService);
    app.register(deleteService);

    // #----- Appointment Routes -----#
    app.register(createAppointmentRoute);
    app.register(getAllAppointmentRoute);
    app.register(getAppointmentById);
    app.register(updateAppointment);
    app.register(deleteAppointment);

    // #----- BreakingTime Routes -----#
    app.register(createBreakingTimeRoute);
    app.register(getAllBreakingTimeRoute);
    app.register(getBreakingTimeById);
    app.register(updateBreakingTime);
    app.register(deleteBreakingTime);

    return app;
}