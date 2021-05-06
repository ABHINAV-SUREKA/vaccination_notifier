const express = require("express")
    , app = express()
    , bodyParser = require("body-parser")
    , nodemailer = require("nodemailer")
    , axios = require("axios")
    , mongodb = require('mongodb').MongoClient
    , cron = require('node-cron')
    , nodemon = require("nodemon")
    , dateFormat = require("dateformat")
    , path = require("path")
    , static_path = path.join(__dirname, "public");

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

// Setting up SMTP transport connection
let transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '745778adf30aa6',
        pass: '14695989ce87e5'
    }
});


// Send periodic emails to subscribers
cron.schedule("*/1 * * * *", () => {
    console.log("cron running");
    database.collection("users").find({}).toArray(function (error, result) {
        if (error) throw error;
        result.forEach(element => {
            if (checkSlots(element)) {
                if (!element.hasOwnProperty("last_notified_ts") || element.last_notified_ts.toString().length == 0) {
                    emailNotifier(element.email, (error) => {
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
                                emailNotifier(element.email, (error) => {
                                    console.log(error);
                                })
                                    .then((promise) => {
                                        console.log(promise)
                                    }) // .then() and .catch() are redundant here
                                    .catch((error) => {
                                        console.log(error)
                                    });
                            break;
                        case "every 3 hours":
                            if (180 <= timeDiffInMins)
                                emailNotifier(element.email, (error) => {
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
                                emailNotifier(element.email, (error) => {
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
                                emailNotifier(element.email, (error) => {
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
                                emailNotifier(element.email, (error) => {
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
        let slots_calender_by_pin_data = await slotsCalenderByPin(element);
        let sessionFilteredData = await slots_calender_by_pin_data.centers.map((center) => {
            return {...center, sessions: center.sessions.filter(session => session.min_age_limit <= parseInt(element.age) &&  session.available_capacity > 0)};
        });
        centerFilteredData = await sessionFilteredData.filter(center => center.sessions.length > 0);
        return await centerFilteredData;
    } else if(element.location && element.location == "district") {
        let slots_calender_by_district_data = await slotsCalenderByDistrict(element);
        let sessionFilteredData = await slots_calender_by_district_data.centers.map((center) => {
            return {...center, sessions: center.sessions.filter(session => session.min_age_limit <= parseInt(element.age) &&  session.available_capacity > 0)};
        });
        let centerFilteredData = await sessionFilteredData.filter(center => center.sessions.length > 0);
        return await centerFilteredData;
    } else if(element.location && element.location == "state") {
        let slots_calender_by_state_data = await slotsCalenderByState(element);
        let sessionFilteredData = await slots_calender_by_state_data.map((center) => {
            return {...center, sessions: center.sessions.filter(session => session.min_age_limit <= parseInt(element.age) &&  session.available_capacity > 0)};
        });
        let centerFilteredData = await sessionFilteredData.filter(center => center.sessions.length > 0);
        return await centerFilteredData;
    }
}
// Send email notification
let emailNotifier = async (toEmail,callback) => {
    const text = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"></head>" +
        "<body>" +
        "<h1>Vaccination available near you!</h1><p>Get your vaccine today!</p>" +
        "</body></html>";
    const message = {
        from: "no-reply@vaccination.notifier.com",
        to: toEmail,
        subject: "Vaccination availability near you",
        text: text
    };
    const notifiedTimestamp = Date.now();
    await transport.sendMail(message, (error, result) => { // transport.sendMail() uses callback that's why await won't work here
        if (error) callback(error);
        console.log("Notification sent to " + toEmail + " on " + new Date(notifiedTimestamp));
        database.collection("users").updateOne({email: toEmail}, {$set: {last_notified_ts: notifiedTimestamp}}, (error, result) => {
            if (error) callback(error);
            if(result.modifiedCount == 1)
                console.log("Updated 'last_notified_ts' for " + toEmail + " with " + notifiedTimestamp);
        });
    });
    return "sending mail...";
}


// Fetch info from Cowin
let getStates = async () => {
    let config = {
        method: "get",
        url: "https://cdn-api.co-vin.in/api/v2/admin/location/states",
        headers: {
            "accept": "application/json",
            "Accept-Language": "hi_IN",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        }
    }
    let response = await axios(config);
    return await response.data;
};

// Fetch info from Cowin
let getDistricts = async (stateId) => {
    if (stateId == undefined) {
        let promised_state_data = await getStates();
        let combinedStateDistrictDataList = [];
        for (i = 0; i < promised_state_data.states.length; i++) {
            let config = {
                method: "get",
                url: "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + promised_state_data.states[i].state_id,
                headers: {
                    "accept": "application/json",
                    "Accept-Language": "hi_IN",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
                }
            }
            let response = await axios(config);
            let combinedStateDistrictData = {
                state_id: promised_state_data.states[i].state_id,
                state_name: promised_state_data.states[i].state_name,
                districts: response.data.districts
            };
            await combinedStateDistrictDataList.push(combinedStateDistrictData);
        }
        console.log(combinedStateDistrictDataList);
        return combinedStateDistrictDataList;
    } else if (stateId != "") {
        let config = {
            method: "get",
            url: "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + parseInt(stateId),
            headers: {
                "accept": "application/json",
                "Accept-Language": "hi_IN",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
            }
        }
        let response = await axios(config);
        return await response.data;
    }
};

// Fetch info from Cowin
let slotsCalenderByPin = async (element) => {
    let config = {
        method: "get",
        url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=" + element.location_value + "&date=" + dateFormat(new Date(), "dd-mm-yyyy"),
        headers: {
            "accept": "application/json",
            "Accept-Language": "hi_IN",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        }
    }
    let response = await axios(config);
    return await response.data;
};

// Fetch info from Cowin
let slotsCalenderByDistrict = async (element) => {
    let config = {
        method: "get",
        url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + element.location_value + "&date=" + dateFormat(new Date(), "dd-mm-yyyy"),
        headers: {
            "accept": "application/json",
            "Accept-Language": "hi_IN",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        }
    }
    let response = await axios(config);
    return await response.data;
};

// Fetch info from Cowin
let slotsCalenderByState = async (element) => {
    let promised_district_data = await getDistricts(element.location_value);
    let combinedDistrictDataList = [];
    console.log(promised_district_data);
    for (i = 0; i < promised_district_data.districts.length; i++) {
        let config = {
            method: "get",
            url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + promised_district_data.districts[i].district_id + "&date=" + dateFormat(new Date(), "dd-mm-yyyy"),
            headers: {
                "accept": "application/json",
                "Accept-Language": "hi_IN",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
            }
        }
        let response = await axios(config);
        console.log(response.data);
        await combinedDistrictDataList.push(response.data.centers)
    }
    return await combinedDistrictDataList;
};

// Handling server side request and response
app.get("/", (request,response) => {
    response.sendFile(path.join(static_path, "/index.html"));
});

app.get("/state_list", async (request,response) => {
    let promised_state_data = await getStates();
    response.send(promised_state_data);
});

app.get("/district_list", async (request,response) => {
    let promised_district_data = await getDistricts();
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
                    last_notified_ts: Date.now(),
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