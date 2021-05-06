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
    , email = require("./email");

app.use(express.static(static_path));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


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
    await database.collection("users").find({}).toArray(function (error, result) {
        if (error) throw error;
        result.forEach(element => {
            let centerFilteredData = checkSlots(element).catch((error) => {console.log(error);});
            if (centerFilteredData) {
                if (!element.hasOwnProperty("last_notified_ts") || element.last_notified_ts.toString().length == 0) {
                    email.emailNotifier(element.email, centerFilteredData, (error) => {
                        console.log(error);
                    })
                        .then((promise) => {
                            console.log(promise)
                        }) // .then() and .catch() are redundant here
                        .catch((error) => {
                            console.log(error)
                        });
                } else {
                    let timeDiffInMins = Math.abs((Date.now() - element.last_notified_ts) / (1000 * 60));
                    switch (element.frequency) {
                        case "every hour":
                            if (60 <= timeDiffInMins)
                                email.emailNotifier(element.email, (error) => {
                                    console.log(error);
                                })
                                    .then((promise) => {
                                        console.log(promise)
                                    }) // .then() and .catch() are redundant here
                                    .catch((error) => {
                                        console.log(error)
                                    });
                            break;
                        case "every 6 hours":
                            if (360 <= timeDiffInMins)
                                email.emailNotifier(element.email, (error) => {
                                    console.log(error);
                                })
                                    .then((promise) => {
                                        console.log(promise)
                                    }) // .then() and .catch() are redundant here
                                    .catch((error) => {
                                        console.log(error)
                                    });
                            break;
                        case "every 12 hours":
                            if (720 <= timeDiffInMins)
                                email.emailNotifier(element.email, (error) => {
                                    console.log(error);
                                })
                                    .then((promise) => {
                                        console.log(promise)
                                    }) // .then() and .catch() are redundant here
                                    .catch((error) => {
                                        console.log(error)
                                    });
                            break;
                        case "every day":
                            if (1440 <= timeDiffInMins)
                                email.emailNotifier(element.email, (error) => {
                                    console.log(error);
                                })
                                    .then((promise) => {
                                        console.log(promise)
                                    }) // .then() and .catch() are redundant here
                                    .catch((error) => {
                                        console.log(error)
                                    });
                            break;
                    }
                }
            }
        });
    });
})

// Check slots
let checkSlots = async (element) => {
    let centerFilteredData = [];
    if (element.location && element.location == "pincode") {
        let slots_calender_by_pin_data = await cowin.slotsCalenderByPin(element);
        let sessionFilteredData = await slots_calender_by_pin_data.centers.map((center) => {
            return {...center, sessions: center.sessions.filter(session => session.min_age_limit <= parseInt(element.age) &&  session.available_capacity > 0)};
        });
        centerFilteredData = await sessionFilteredData.filter(center => center.sessions.length > 0);
        console.log(centerFilteredData);
        return centerFilteredData;
    } else if(element.location && element.location == "district") {
        let slots_calender_by_district_data = await cowin.slotsCalenderByDistrict(element);
        let sessionFilteredData = await slots_calender_by_district_data.centers.map((center) => {
            return {...center, sessions: center.sessions.filter(session => session.min_age_limit <= parseInt(element.age) &&  session.available_capacity > 0)};
        });
        let centerFilteredData = await sessionFilteredData.filter(center => center.sessions.length > 0);
        return centerFilteredData;
    }
}




// Handling server side request and response
app.get("/", (request,response) => {
    response.sendFile(path.join(static_path, "/index.html"));
});
app.get("/district_list", async (request,response) => {
    let promised_district_data = await cowin.getAllDistricts();
    response.send(promised_district_data);
});
app.post("/action",(request,response) => {
    console.log(request.body);
    /*let mongoClient = new mongoDBConnect();
    let database = mongoClient.client.db("Users");*/
    database.collection('users').findOne({email: request.body.email}, (error, result) => {
        if (error) throw error;
        if (request.body.subscribe != null) {
            if (result == null) {
                database.collection("users").insertOne({
                    email: request.body.email,
                    frequency: request.body.frequency,
                    age: request.body.age,
                    location: request.body.location,
                    location_value: request.body.location_value,
                }, (error, result) => {
                    if (error) throw error;
                    if (result.insertedCount == 1)
                        response.send(result.ops[0].email + " successfully subscribed to receive email notification " + request.body.frequency);
                });
            } else {
                if (request.body.frequency == result.frequency)
                    response.send(request.body.email + " has already subscribed to receive email notification " + request.body.frequency);
                else {
                    database.collection("users").updateOne({email: request.body.email}, {$set: {frequency: request.body.frequency}}, (error, result) => {
                        if (error) throw error;
                        if(result.modifiedCount == 1)
                            response.send(request.body.email + " successfully updated email notification frequency to " + request.body.frequency);
                    });
                }
            }
        } else if (request.body.unsubscribe != null) {
            if (result == null) {
                response.send(request.body.email + " is not subscribed to email notification");
            } else {
                database.collection("users").deleteMany({email: request.body.email}, (error, result) => {
                    if (error) throw error;
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