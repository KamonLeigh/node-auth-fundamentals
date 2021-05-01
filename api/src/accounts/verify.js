import cryto from 'crypto';
const { ROOT_DOMAIN, JWT_SIGNATURE} = process.env;

export async function createVerifyEmailToken(email) {
    // Auth String, JWT signature, email
    const authString = `${JWT_SIGNATURE}:${email}`;
    return cryto.createHash('sha256').update(authString).digest('hex');

    try {
        
    } catch (error) {
        
    }
}

export async function createVerifyEmailLink(email) {
    try {
        // Create token
        const emailToken = await createVerifyEmailToken(email);
        // Encore url string
        const URIencodedEmail = encodeURIComponent(email);
        // Return link for verfication
        return `https://${ROOT_DOMAIN}/verify/${URIencodedEmail}/${emailToken}`
        
    } catch (error) {
        
    }
}