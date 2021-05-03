import cryto from 'crypto';
const { ROOT_DOMAIN, JWT_SIGNATURE} = process.env;

function createResetToken(email, expTimestamp) {
    // Auth String, JWT signature, email
    const authString = `${JWT_SIGNATURE}:${email}:${expTimestamp}`;
    return cryto.createHash('sha256').update(authString).digest('hex');

}

export async function createResetEmailLink(email) {
    try {
        // Encore url string
        const URIencodedEmail = encodeURIComponent(email);
        // Create timestamp
        const expTimestamp = Date.now() + 24 * 60 * 60 * 1000;
        // Create token
        const token = createResetToken(email, expTimestamp);
        // Return link for verfication
        return `https://${ROOT_DOMAIN}/reset/${URIencodedEmail}/${expTimestamp}/${token}`
        
    } catch (error) {
        
    }
}

export async function createResetLink(email) {
    try {
        const { user } = await import("../user/user.js");

    const foundUser = await user.findOne({
            "email.address": email
           })

    // If user exists
    if (foundUser) {
        // Create email link
        const link = await createResetEmailLink(email);
        return link
    }

    return '';

    } catch (error) {
       console.error(error);
       return false;
    }
}