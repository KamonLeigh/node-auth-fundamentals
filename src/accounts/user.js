import mongo from "mongodb";
import jwt from 'jsonwebtoken';
import { createTokens }  from './tokens.js'

const { ObjectId } = mongo;

const JWTSignature = process.env.JWT_SIGNATURE;
const { ROOT_DOMAIN } = process.env;
export async function getUserFromCookies(request, reply) {
    try {
        const { user } = await import("../user/user.js");
        const { session } = await import("../session/session.js");
        // Check to make sure access token
        if (request?.cookies?.accessToken) {
            const { accessToken }  = request.cookies;
            // Decode decode access token
            const decodedAccessToken = jwt.verify(accessToken, JWTSignature);
            //Return user from record 
            return user.findOne({
                _id : ObjectId(decodedAccessToken?.userId)
            })
        }


        if (request?.cookies?.refreshToken) {
            const {  refreshToken } =  request.cookies;
            const { sessionToken } = jwt.verify(refreshToken, JWTSignature);

            const currentSession = await session.findOne({ sessionToken});
            console.log(currentSession)

            if (currentSession.valid) {
                const currentUser = await user.findOne({
                    _id : ObjectId(currentSession.userId)
                })

                // refresh token
                await refreshTokens(sessionToken, currentUser._id, reply)
                return currentUser;
            }
        }

    
        
    } catch (error) {
        console.error(error)
    }
}

export async function refreshTokens(sessionToken, userId, reply) {

    try {
    const { accessToken, refreshToken}  = await createTokens(sessionToken, userId);
    
    const now = new Date();
    const refreshExpires = now.setDate(now.getDate() + 30);

    reply.setCookie("refreshToken", refreshToken, {
        path:"/",
        domain:ROOT_DOMAIN,
        httpOnly: true,
        expires: refreshExpires,
        secure: true
    })
    .setCookie("accessToken", accessToken, {
        path:"/",
        domain:ROOT_DOMAIN,
        httpOnly: true,
        secure: true
    })
    } catch (error) {
        console.error(error)
    }
}