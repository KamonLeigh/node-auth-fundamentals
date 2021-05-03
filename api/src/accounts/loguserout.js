import jwt from "jsonwebtoken"

const JWTSignature = process.env.JWT_SIGNATURE;
const { ROOT_DOMAIN } = process.env;
export async function logUserOut(request, reply) {

    try {
         const { session } = await import("../session/session.js")
         
         if (request?.cookies?.refreshToken) {
            // Get refreshToken
            const {  refreshToken } =  request.cookies;
            // Decode sessionToken from refreshToken 
            const { sessionToken } = jwt.verify(refreshToken, JWTSignature);
             // Delete database record for session
             await session.deleteOne({ sessionToken});
            
         }

         reply.clearCookie("refreshToken",{
             path: "/",
             domain: ROOT_DOMAIN,
             httpOnly: true,
             secure: true
         })
         .clearCookie("accessToken",{
             path: "/",
             domain: ROOT_DOMAIN,
             httpOnly: true,
             secure: true,
         });
        
    } catch (error) {
        
    }

}  





