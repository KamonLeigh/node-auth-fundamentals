import jwt from "jsonwebtoken";

const JWTSignature = process.env.JWT_SIGNATURE;

export async function createTokens(sessionToken, userId) {
  try {
    // Create Refesch token
    // Session id
    const refreshToken = jwt.sign(
      {
        sessionToken,
      },
      JWTSignature
    );
    // Create Acess Token
    // session id userId
    const accessToken = jwt.sign(
      {
        sessionToken,
        userId,
      },
      JWTSignature
    );
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error);
  }
}
