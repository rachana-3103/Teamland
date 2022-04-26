const nodemailer = require('nodemailer');

exports.sendMail = async (toMail, subject, body) => {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.user,
            pass: process.env.pass,
        },
    });

    const mailOptions = {
        from: process.env.sender,
        to: toMail,
        subject,
        html: body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('🚀 TCL -> transporter.sendMail -> error', error);
            return error;
        }
        console.log(`Email sent: ${info.response}`, 'email>', toMail);
    });
};