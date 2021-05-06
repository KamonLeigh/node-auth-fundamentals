import bcrypt from 'bcryptjs';

const { compare } = bcrypt; 

export async function authoriseUser(email, password) {
    // Look up user 
    const { user } = await import('../user/user.js')

    const userData = await user.findOne({
        "email.address": email
    })

    if (userData) {
    // Get user password 
    const savedPassword = userData.password;
    // Compare to password to password in databse
    const isAuthorised = await compare(password, savedPassword);
    // return if password matches  
    console.log(isAuthorised);
    return { 
        isAuthorised, 
        userId: userData._id, 
        authenticatorSecret: userData?.authenticator };
    }

    return {
        isAuthorised: false,
        userId: null,
        authenticatorSecret: null
    }
}