const express = require("express")
    , app = express()
    , bodyParser = require("body-parser")
    , nodemailer = require("nodemailer")
    , axios = require("axios")
    , cron = require('node-cron')
    , nodemon = require("nodemon")
    , fs = require('fs')
    , dateFormat = require("dateformat")
    , path = require("path")
    , static_path = path.join(__dirname, "public")
    , cowin = require("./cowin")
    , email = require("./email")
    , slot = require("./slot")
    , db = require( './db' )
    , content = require('./content');

app.use(express.static(static_path));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
let errorHandler = (error) => { console.log("Error encountered: " + error); }


// Send periodic emails to subscribers
cron.schedule("*/1 * * * *", async () => {
    console.log("cron running");
    const cursor = await db.findAllDoc(errorHandler);
    const results = await cursor.toArray();
    for (const element of results) {
        if (!element.hasOwnProperty("last_notified_ts") || element.last_notified_ts.toString().length == 0) {
            let centerFilteredData = await slot.checkSlots(element,errorHandler);
            if (centerFilteredData) {
                await email.emailNotifier(element.email,centerFilteredData,errorHandler);
            }
        } else {
            let timeDiffInMins = await Math.abs((Date.now() - element.last_notified_ts) / (1000 * 60));
            switch (element.frequency) {
                case "every hour":
                    if (60 <= timeDiffInMins) {
                        let centerFilteredData = await slot.checkSlots(element, errorHandler);
                        if (centerFilteredData) {
                            await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                        }
                    }
                    break;
                case "every 6 hours":
                    if (360 <= timeDiffInMins) {
                        let centerFilteredData = await slot.checkSlots(element, errorHandler);
                        if (centerFilteredData) {
                            await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                        }
                    }
                    break;
                case "every 12 hours":
                    if (720 <= timeDiffInMins) {
                        let centerFilteredData = await slot.checkSlots(element, errorHandler);
                        if (centerFilteredData) {
                            await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                        }
                    }
                    break;
                case "every day":
                    if (1440 <= timeDiffInMins) {
                        let centerFilteredData = await slot.checkSlots(element, errorHandler);
                        if (centerFilteredData) {
                            await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                        }
                    }
                    break;
            }
        }
    }
})


// Handling server side requests and responses
app.get("/", async (request,response) => {
    await response.sendFile(path.join(static_path, "/index.html"));
});
app.get("/district_list", async (request,response) => {
    let promised_district_data = await cowin.getAllDistricts(errorHandler);
    await response.send(promised_district_data);
});
app.post("/action",async (request,response) => {
    console.log(request.body);
    if (request.body.subscribe != null) {
        let result = await db.findOneDoc({email: request.body.email}, errorHandler);
        if (result == null) {
            result = await db.insertOneDoc({
                email: request.body.email,
                frequency: request.body.frequency,
                age: request.body.age,
                location: request.body.location,
                location_value: request.body.location_value,
            }, errorHandler);
            if (result.insertedCount == 1)
                await response.send(result.ops[0].email + " successfully subscribed to receive email notification " + request.body.frequency);
        } else {
            result = await db.updateOneDoc({email: request.body.email}, {
                $set: {
                    frequency: request.body.frequency,
                    age: request.body.age,
                    location: request.body.location,
                    location_value: request.body.location_value,
                }}, errorHandler);
                if(result.modifiedCount >= 1)
                    response.send(request.body.email + " already subscribed | Successfully updated email notification preferences");
        }
    } else if (request.body.unsubscribe != null) {
        let result = await db.findOneDoc({email: request.body.email}, errorHandler);
        if (result == null) {
            await response.send(request.body.email + " is not subscribed to email notification");
        } else {
            result = await db.deleteManyDoc({email: request.body.email}, errorHandler);
            if (result.deletedCount >= 1)
                await response.send(request.body.email + " successfully unsubscribed from email notification");
        }
    } else if (request.body.check_availability != null) {
        let centerFilteredData = await slot.checkSlots(request.body,errorHandler);
        if (centerFilteredData) {
            return await content.contentFormatter(centerFilteredData);
        }
    }
});




// Run application server
const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Server is running at port: "+ port);
});

// Connect to MongoDB
db.dbConnect(errorHandler).then(() => {
    console.log("Connected to mongoDB");
});
