import cryto from 'crypto';
const { ROOT_DOMAIN, JWT_SIGNATURE} = process.env;

function createResetToken(email, expTimestamp) {
    // Auth String, JWT signature, email
    const authString = `${JWT_SIGNATURE}:${email}:${expTimestamp}`;
    return cryto.createHash('sha256').update(authString).digest('hex');

}

function validateExpTimestamp(expTimestamp) {
    // One day in milliseconds
    const expTime = 24 * 60 * 60 * 1000
    // Difference between now ans expired time
    const dateDiff = Number(expTimestamp) - Date.now();
    // We're expired if not in past or difference is less 24 hours
    const isValid = dateDiff > 0 && dateDiff < expTime;
    return isValid;
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

export async function validateResetEmail(token, email, expTimestamp) {
    try {
        // create a hash and token
        const resetToken = createResetToken(email, expTimestamp);

        // Compare hash with token
        const isValid = resetToken === token;

        // Check if time is valid 
        const isTimestampValid = validateExpTimestamp(expTimestamp);
        return isValid && isTimestampValid;
    } catch (error) {
       console.error(error);
       return false;
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