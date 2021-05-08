const nodemailer = require("nodemailer")
    , fs = require('fs')
    , dateFormat = require("dateformat")
    , { google } = require("googleapis")
    , db = require( './db' )
    , content = require('./content');


// Setting up Google OAuth
const CLIENT_ID = "719978622955-ru6f7sgektqhm473tvtffql584alsko4.apps.googleusercontent.com";
const CLIENT_SECRET = "mhfWBohKeALkHqo4nZWtOKVP";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "1//04XlgnvAX1WlxCgYIARAAGAQSNwF-L9Ir53nOG4Kdgj0apw_KtBcKIopxBY4i8RK3MwPvooJhHy9lQGGYJjurCiOPl83Y_ya4bko";
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

// Setting up SMTP transport connection
/*let transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '745778adf30aa6',
        pass: '14695989ce87e5'
    }
});*/

// Send email notification
let emailNotifier = async (toEmail,centerFilteredData,errorHandler) => {
    const html = await content.contentFormatter(centerFilteredData);
    const text = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"></head>" +
        "<body>" +
        "<h1>Vaccination available near you!</h1><p>Get your vaccine today!</p>" +
        "</body></html>";
    const accessToken = await oAuth2Client.getAccessToken(); // fetch accessToken everytime as it gets updated periodically
    // Setting up SMTP transport connection
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: "sureka.abhinav@gmail.com",
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
        },
    });
    const message = {
        from: "no-reply@vaccination.notifier.com",
        to: toEmail,
        subject: "Vaccination availability near you",
        text: text,
        html: html.html,
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