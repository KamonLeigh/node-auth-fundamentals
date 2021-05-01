import "./env.js";
import { fastify } from "fastify";
import fastifyStatic from "fastify-static";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./db.js";
import { registerUser } from "./accounts/register.js";
import { authoriseUser } from "./accounts/authorise.js";
import { logUserIn } from "./accounts/loguserin.js";
import { logUserOut } from "./accounts/loguserout.js"
import { getUserFromCookies } from "./accounts/user.js";
import { sendEmail, mailInit } from "./mail/index.js";
import { createVerifyEmailLink, validateVerifyEmail} from './accounts/verify.js'
import { realpathSync } from "fs";


// ESM specific feature
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify();

async function startApp() {
  try {
    await mailInit();
  
    app.register(fastifyCors, {
      origin: [
        /\.nodeauth.dev/,
        'https://nodeauth.dev'
      ],
      credentials: true
    })

    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SIGNATURE,
    });
    app.register(fastifyStatic, {
      root: path.join(__dirname, "public"),
    });

    app.post("/api/register", {}, async (request, reply) => {
      try {
       const userId = await registerUser(request.body.email, request.body.password);
      
      // If account creation is successful
      if (userId) {
          const emailLink = await createVerifyEmailLink(request.body.email);

          await sendEmail({
            to: request.body.email,
            subject: "verify your email",
            html:`<a href="${emailLink}">verify</a>`
          });

          await logUserIn(userId, request, reply);


          reply.send({
              data: {
                  status: "SUCCESS",
                  userId
              }
          })
      }

      } catch (error) {
        console.error(error);
        reply.send({
            data: {
                status: "FAILED",
            }
        })
    }
    });

    app.post("/api/authorise", {}, async (request, reply) => {
      try {
        console.log(request.body);
        const { isAuthorised, userId } = await authoriseUser(
          request.body.email,
          request.body.password
        );

        if (isAuthorised) {
          await logUserIn(userId, request, reply);
          reply.send({
            data: {
                status: "SUCCESS",
            }
        })
        }

        reply.send({
            data: {
                status: "FAILED",
            }
        })
      } catch (error) {
        console.error(error);
        reply.send({
            data: {
                status: "FAILED",
            }
        })
      }
    });

    app.get("/test", {}, async (request, reply) => {
      try {
        // Verify user login
        const user = await getUserFromCookies(request, reply);
        // Return user email if exists otherwise return unauthorised
        if (user) {
          reply.send({
            data: user,
          });
        } else {
          reply.send({
            data: "User not found",
          });
        }
      } catch (error) {
        throw new Error(e);
      }
    });

    app.post("/api/logout", {}, async (request, reply) => {
        try {
            await logUserOut(request, reply);
            reply.send({
                data: {
                    status: "SUCCESS",
                }
            })
            
        } catch (error) {
            reply.send({
                data: {
                    status: "FAILED",
                }
            })
        }
    })

    app.post("/api/verify", {}, async (request, reply) => {
      try {
        const { token, email } = request.body;

        const isValid = await validateVerifyEmail(token, email);
        console.log({ email, token });

        if (isValid) {
          return reply.code(200).send();
        }
        
         return reply.code(401).send();
      } catch (error) {
          return reply.code(401).send();
      }
  })

    await app.listen(3000);
    console.log("Server Listening at port : 3000");
  } catch (error) {
    console.error(error);
  }
}

connectDb().then(() => startApp());
