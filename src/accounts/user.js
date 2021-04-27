import mongo from "mongodb";
import jwt from 'jsonwebtoken';

const { ObjectId } = mongo;

const JWTSignature = process.env.JWT_SIGNATURE;
export async function getUserFromCookies(request) {
    try {
        const { user } = await import("../user/user.js");
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


        // Get the access and refresh token
        // if access token
        
        // Decode refresh token
        // Look up session
        // Confirm session is valid
        // if session is valid refresch token
        // Look up current user
        // Return current user
        
    } catch (error) {
        console.error(e)
    }
}

export async function refreshToken() {

    try {
        
    } catch (error) {
        console.error(error)
    }
}