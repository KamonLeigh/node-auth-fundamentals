import "./env.js";
import { fastify } from "fastify";
import fastifyStatic from "fastify-static";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import path from "path";
import { authenticator } from "@otplib/preset-default"
import { fileURLToPath } from "url";
import { connectDb } from "./db.js";
import { registerUser } from "./accounts/register.js";
import { authoriseUser } from "./accounts/authorise.js";
import { logUserIn } from "./accounts/loguserin.js";
import { logUserOut } from "./accounts/loguserout.js"
import { getUserFromCookies, changePassword } from "./accounts/user.js";
import { sendEmail, mailInit } from "./mail/index.js";
import { createVerifyEmailLink, validateVerifyEmail} from './accounts/verify.js'
import { realpathSync } from "fs";
import {  createResetLink, validateResetEmail } from "./accounts/reset.js"

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

    app.get('/api/user', {}, async (request, reply) => {
      const user = await getUserFromCookies(request, reply);
      if (user) return reply.send({ data: user});
      reply.send({});
    });

    app.post("/api/2fa-register", {}, async(request, reply) =>{
      // verfy user login
      const user = await getUserFromCookies(request, reply);
      const { token, secret } = request.body;
      const isValid = authenticator.verify({ token, secret});
      console.log(isValid)
      reply.send("success")

    })

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

  app.post("/api/forgot-password", {}, async (request, reply) => {
    try {
      const { email } = request.body;
      const link = await createResetLink(email);

      if (link) {
        await sendEmail({
          to: email,
          subject: "Reset password",
          html: `<a href="${link}">reset</a>`
        })
      }
      // check to see if a user exists with that email
      // If user exists
      // Create email link
      // Link email contains user email, token, exppiration date
      // send email ???
       return reply.code(200).send();
    } catch (error) {
        return reply.code(401).send();
    }
})

  app.post("/api/change-password", {}, async(request, reply) => {

    try {

    // Verify user login
    const user = await getUserFromCookies(request, reply);
    // Compare current logged in user with form re-auth 
    console.log(user);
   const {oldPassword, newPassword } =  request.body;
    if (user?.email?.address) {
      const { isAuthorised, userId} = await authoriseUser(
        user.email.address,
        oldPassword
       )
       console.log(isAuthorised, "isA")
       // If user is who they say they are
       if (isAuthorised) {

        await changePassword(userId, newPassword);

        // Update password in db
        return reply.code(200).send("All Good")
       }


       
    }
      return reply.code(401).send();
    } catch (error) {
      return reply.code(401).send();
    }
  })

  app.post("/api/reset", {}, async (request, reply) => {

    try {
      const { email, password, token, time } = request.body;
      const isValid = await validateResetEmail(token, email, time);
      
      if (isValid) {
        // Find User
        const { user } = await import("./user/user.js");
        const currentUser = await user.findOne({
          "email.address": email
        });

        // Change password 
        await changePassword(currentUser._id, password)
        return reply.code(200).send('Updated Password');
      }

      return reply.code(401).send('failed to up update');
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
