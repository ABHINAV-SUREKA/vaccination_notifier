const nodemailer = require("nodemailer")
    , content = require('./email_content');


/*// Setting up SMTP transport connection (Using SendGrid)
let transport = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
    },
    debug: true
});*/

// for running in local machine, use below transport config
/*let transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '745778adf30aa6',
        pass: '14695989ce87e5'
    }
});*/

// for sending mail using AWS SES
let transport = nodemailer.createTransport({
    host: "email-smtp.ap-south-1.amazonaws.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    debug: true
});


// Send email notification
let emailNotifier = async (toEmail,centerFilteredData,errorHandler) => {
    try {
        const html = await content.emailContentFormatter(centerFilteredData);
        const text = "Vaccination available in your preferred location! Get vaccinated today.";
        const message = {
            from: "'Vaccine Notifier' <sureka.abhinav.2.0@gmail.com>",
            to: toEmail,
            subject: "Vaccination availability near you",
            text: text,
            html: html.html,
        };
        return await transport.sendMail(message);
    } catch (error) {
        errorHandler(error);
    }
}

// Send verification email
let emailVerifier = async (toEmail,content,errorHandler) => {
    try {
        let html = `
        <html>
        <head xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
            <title>Vaccination Notifier</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body class="text-center" data-new-gr-c-s-check-loaded="14.1008.0" data-gr-ext-installed="">` + content + `</body>
        </html>
        `;
        const text = content;
        const message = {
            from: "'Vaccine Notifier' <sureka.abhinav.2.0@gmail.com>",
            to: toEmail,
            subject: "Verify email",
            text: text,
            html: html,
        };
        return await transport.sendMail(message);
    } catch (error) {
        errorHandler(error);
    }
}


module.exports = { emailNotifier, emailVerifier };