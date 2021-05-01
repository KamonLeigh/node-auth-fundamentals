import { fastify } from "fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify();

async function startApp() {
    try {
        app.register(fastifyStatic, {
            root: path.join(__dirname, "public")
        })
        
        const PORT = 5000;
        await app.listen(PORT);
        console.log(`Server Listening at port: ${PORT}`);
    } catch (error) {
        console.error(error)
    }
}

startApp();