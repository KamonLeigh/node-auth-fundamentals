import "./env.js";
import { fastify } from "fastify";
import fastifyStatic from "fastify-static";
import fastifyCookie from "fastify-cookie";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./db.js";
import { registerUser } from "./accounts/register.js";
import { authoriseUser } from "./accounts/authorise.js";
import { logUserIn } from "./accounts/loguserin.js";
import { logUserOut } from "./accounts/loguserout.js"
import { getUserFromCookies } from "./accounts/user.js";

// ESM specific feature
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify();

async function startApp() {
  try {
    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SIGNATURE,
    });
    app.register(fastifyStatic, {
      root: path.join(__dirname, "public"),
    });

    app.post("/api/register", {}, async (request, reply) => {
      try {
        await registerUser(request.body.email, request.body.password);
      } catch (error) {
        console.error(error);
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
            data: "User logged in",
          });
        }

        reply.send({
          data: "auth failed",
        });
      } catch (error) {
        console.error(error);
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
                data: "User logged out",
              });
            
        } catch (error) {
            
        }
    })

    await app.listen(3000);
    console.log("Server Listening at port : 3000");
  } catch (error) {
    console.error(error);
  }
}

connectDb().then(() => startApp());
