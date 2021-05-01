
import { randomBytes } from  'crypto'
export async function createSession(userId, connection) {
    try {
        // generate session token
    const sessionToken = randomBytes(43).toString('hex');
    // retrieve connection information
    const { ip, userAgent } = connection
    // database insert for session
    const { session } = await import("../session/session.js")
    // Return session token 
    await session.insertOne({
        sessionToken,
        userId,
        valid: true,
        userAgent,
        ip,
        updateAt: new Date(),
        createdAt: new Date()
    });

    return sessionToken;
    } catch (error) {
        throw new Error("Session creation failed ")
    }
    
    

}