
import './env.js';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyCookie from 'fastify-cookie'
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './db.js';
import { registerUser } from './accounts/register.js';
import { authoriseUser } from './accounts/authorise.js'


// ESM specific feature
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = fastify();

async function startApp() {
    try {
        app.register(fastifyCookie, {
            secret: process.env.COOKIE_SIGNATURE
        })
        app.register(fastifyStatic, {
            root: path.join(__dirname, "public")
        });


        app.post('/api/register', {}, async (request, reply) => {
            try {
                await registerUser(request.body.email, request.body.password)
                
            } catch (error) {
                console.error(error)
            }
        });

        app.post('/api/authorise', {}, async (request, reply) => {
            try {

                console.log(request.body)
                await authoriseUser(request.body.email, request.body.password)
                reply.setCookie("testCookie", "this is a test", {
                    path:"/",
                    domain:"localhost",
                    httpOnly: true
                }).send({
                    data: "just testing"
                })
            } catch (error) {
                console.error(error)
            }
        });


        // app.get('/', {}, (request, reply) => {

        //     reply.send({
        //         data: "Hello World",
        //         time : new Date()
        //     })
        // })

        await app.listen(3000);
        console.log('Server Listening at port : 3000')
    } catch (error) {
        console.error(error)
    }
}

connectDb().then(() => startApp())
