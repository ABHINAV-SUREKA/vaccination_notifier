const nodemailer = require("nodemailer")
    , fs = require('fs')
    , dateFormat = require("dateformat")
    , db = require( './db' );


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
    await console.log(centerFilteredData);
    const text = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"></head>" +
        "<body>" +
        "<h1>Vaccination available near you!</h1><p>Get your vaccine today!</p>" +
        "</body></html>";

    let rows = ``;
    for (i = 0; i < centerFilteredData.length; i++) {
        let subrows = ``;
        for (j = 0; j < centerFilteredData.sessions.length; j++) {
            let subrow = `
            <tr>
                <th scope="row">` + (j+1) + `</th>
                <td>` + centerFilteredData.sessions[j].date + `</td>
                <td>` + centerFilteredData.sessions[j].available_capacity + `</td>
                <td>` + centerFilteredData.sessions[j].min_age_limit + `</td>
                <td>` + centerFilteredData.sessions[j].vaccine + `</td>
            </tr>`;
            subrows = subrows + subrow;
        }
        let row = `
        <tr>
            <th scope="row">` + (i + 1) + `</th>
            <td>` + centerFilteredData[i].name + `</td>
            <td>` + centerFilteredData[i].address + `</td>
            <td>` + centerFilteredData[i].district_name + `</td>
            <td>` + centerFilteredData[i].pincode + `</td>
            <td>` + centerFilteredData[i].fee_type + `</td>
            <td>
                <table class="table">
                    <thead class="thead-dark">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Date</th>
                            <th scope="col">Available</th>
                            <th scope="col">Min Age</th>
                            <th scope="col">Vaccine</th>
                        </tr>
                    </thead>
                    <tbody>` + subrows + `</tbody>
                </table>
            </td>
        </tr>`;
        rows = rows + row;
    };
    let html = `
          <html>
            <head><title>Test-email</title></head><body>
            <h3> Available Slots </h3>
            <table id="tests">
                <tr>
                    <th>Center-Name</th>
                    <th>District</th>
                    <th>Pincode</th>
                    <th>Vaccine</th>
                    <th>Fees</th>
                </tr>` + rows +
        `</table></body></html>`;
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