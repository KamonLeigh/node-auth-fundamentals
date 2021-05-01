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

export async function validateVerifyEmail(token, email) {
    try {
       // Create a hash aka token
       const emailToken = await createVerifyEmailToken(email)
       
       // Compare hash with token
       const isValid = token === emailToken

       if (isValid) {
       // If suceesful, update user to make them verfied 
       const { user } = await import("../user/user.js");
       await user.updateOne({
        "email.address": email
       },{
         $set: { "email.verified": true }
       })
        
       return true;

       }

       return false;
    } catch (error) {
       console.error(error);
       return false;
    }
}