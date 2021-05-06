const express = require("express")
    , app = express()
    , bodyParser = require("body-parser")
    , nodemailer = require("nodemailer")
    , axios = require("axios")
    , mongodb = require('mongodb').MongoClient
    , cron = require('node-cron')
    , nodemon = require("nodemon")
    , fs = require('fs')
    , dateFormat = require("dateformat")
    , path = require("path")
    , static_path = path.join(__dirname, "public")
    , cowin = require("./cowin")
    , email = require("./email")
    , slot = require("./slot");

app.use(express.static(static_path));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
let errorHandler = (error) => { console.log("Error encountered: " + error); }


// Setting up MongoDB connection
let database;
let url = "mongodb://localhost:27017";
mongodb.connect(url,(error, client) => {
    if (error)
        throw error;
    console.log("Connected to mongoDB");
    database = client.db("Users");
});



// Send periodic emails to subscribers
cron.schedule("*/1 * * * *", async () => {
    console.log("cron running");
    await database.collection("users").find({}).toArray((error, result) => {
        if (error) errorHandler(error);
        result.forEach(async (element) => {
            if (!element.hasOwnProperty("last_notified_ts") || element.last_notified_ts.toString().length == 0) {
                let centerFilteredData = await slot.checkSlots(element,errorHandler);
                await console.log(centerFilteredData);
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
        });
    });
})


// Handling server side request and response
app.get("/", async (request,response) => {
    await response.sendFile(path.join(static_path, "/index.html"));
});
app.get("/district_list", async (request,response) => {
    let promised_district_data = await cowin.getAllDistricts(errorHandler);
    await response.send(promised_district_data);
});
app.post("/action",async (request,response) => {
    console.log(request.body);
    await database.collection('users').findOne({email: request.body.email}, (error, result) => {
        if (error) errorHandler(error);
        if (request.body.subscribe != null) {
            if (result == null) {
                database.collection("users").insertOne(
                    {
                        email: request.body.email,
                        frequency: request.body.frequency,
                        age: request.body.age,
                        location: request.body.location,
                        location_value: request.body.location_value,
                    }, (error, result) => {
                        if (error) errorHandler(error);
                        if (result.insertedCount == 1)
                            response.send(result.ops[0].email + " successfully subscribed to receive email notification " + request.body.frequency);
                    });
            } else {
                database.collection("users").updateOne({email: request.body.email},
                    {
                        $set: {
                            frequency: request.body.frequency,
                            age: request.body.age,
                            location: request.body.location,
                            location_value: request.body.location_value,
                        }
                    }, (error, result) => {
                        if (error) errorHandler(error);
                        if(result.modifiedCount >= 1)
                            response.send(request.body.email + " already subscribed | Successfully updated email notification preferences");
                });
            }
        } else if (request.body.unsubscribe != null) {
            if (result == null) {
                response.send(request.body.email + " is not subscribed to email notification");
            } else {
                database.collection("users").deleteMany({email: request.body.email}, (error, result) => {
                    if (error) errorHandler(error);
                    if (result.deletedCount >= 1)
                        response.send(request.body.email + " successfully unsubscribed from email notification");
                });
            }
        }
    });
});




// Running application server
const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Server is running at port: "+ port);
});