import nodemailer from 'nodemailer'


export async function mailInit() {

}
export async function sendEmail({
    from = "byronleigh80@gmail.com",
    to = "byronleigh80@gmail.com",
    subject,
    html
}){
 try {
    let testAccount = await nodemailer.createTestAccount()

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    })

    const info = await transporter.sendMail({
        from,
        to,
        subject,
        html
    })

    console.log(info);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
     
 } catch (error) {
     console.error(error)
 }
}