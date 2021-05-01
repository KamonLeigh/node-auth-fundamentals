import https from 'https';
import { fastify } from "fastify";
import fastifyStatic from "fastify-static";
import fetch from "cross-fetch"
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

        app.get("/verify/:email/:token", {}, async (request, reply) => {
            try {
                const { email, token }  = request.params;

                const values = {
                    email,
                    token
                }
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            })

            const res = await fetch('https://api.nodeauth.dev/api/verify', {
                        method: "POST",
                        credentials: "include",
                        agent: httpsAgent,
                        body: JSON.stringify(values),
                        headers: {"Content-type": "application/json; charset=UTF-8"}
                    })

            if (res.status == 200) {
                return reply.redirect("/")
            }

            console.log(res);
            reply.code(401).send()
                
            } catch (error) {
                console.error(error);
                reply.code(401).send()
            }
        })
        
        const PORT = 5000;
        await app.listen(PORT);
        console.log(`Server Listening at port: ${PORT}`);
    } catch (error) {
        console.error(error)
    }
}

startApp();