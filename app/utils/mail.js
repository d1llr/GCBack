import nodemailer from 'nodemailer'


const transporter = nodemailer.createTransport({
    host: "smtp.mail.selcloud.ru",
    port: 1127,
    secure: true,
    auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: "1105",
        pass: "AuIGq91OU2mPIzvF",
    },
});


export const sendEmail = async (to, subject, text) => {
    await transporter.sendMail({
        from: '<no-reply@pacgc.pw>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: `<b>${text}</b>`, // html body
    }).then((status) => {
        console.log(status);
    }).catch(err => {
        console.log(err);
    })
}