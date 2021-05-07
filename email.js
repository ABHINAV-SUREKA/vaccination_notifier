const nodemailer = require("nodemailer")
    , fs = require('fs')
    , dateFormat = require("dateformat")
    , db = require( './db' )
    , content = require('./content');


// Setting up SMTP transport connection
let transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '745778adf30aa6',
        pass: '14695989ce87e5'
    }
});

let emailNotifier = async (toEmail,centerFilteredData,errorHandler) => {
    let html = await content.contentFormatter(centerFilteredData);
    const text = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"></head>" +
        "<body>" +
        "<h1>Vaccination available near you!</h1><p>Get your vaccine today!</p>" +
        "</body></html>";
    const message = {
        from: "no-reply@vaccination.notifier.com",
        to: toEmail,
        subject: "Vaccination availability near you",
        text: text,
        html: html,
    };
    const notifiedTimestamp = await Date.now();
    await transport.sendMail(message, async (error, info) => { // transport.sendMail() uses callback that's why await won't work here
        if (error) errorHandler(error);
        console.log("Notification sent to " + toEmail + " on " + new Date(notifiedTimestamp));
        let result = await db.updateOneDoc({email: toEmail},{
            $set: {
                last_notified_ts: notifiedTimestamp,
            }}, errorHandler);
        if (error) errorHandler(error);
        if(result.modifiedCount == 1)
            await console.log("Updated 'last_notified_ts' for " + toEmail + " with " + notifiedTimestamp);
        });
    return "sending mail...";
}


module.exports = { emailNotifier };