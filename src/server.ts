import { buildApp } from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

async function startServer() {
    const app = await buildApp();  
    try {
        await app.listen({
            port: PORT,
            host: "0.0.0.0"
        }).then(() => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
        
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

startServer();