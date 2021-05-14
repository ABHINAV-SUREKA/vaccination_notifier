const express = require("express")
    , app = express()
    , bodyParser = require("body-parser")
    , cron = require('node-cron')
    , dotenv = require('dotenv')
    , jwt = require('jsonwebtoken')
    , path = require("path")
    , static_path = path.join(__dirname, "public")
    , cowin = require("./cowin")
    , email = require("./email")
    , slot = require("./slot")
    , db = require( './db' )
    , content = require('./web_content')
    , collectionName = "users";

dotenv.config();
app.use(express.static(static_path));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
let errorHandler = (error) => { console.log("Error encountered: " + error); }


// Send periodic emails to subscribers
cron.schedule("*/5 * * * *", async () => {
    console.log("cron running");
    if (undefined == await db.getDb(errorHandler)) {
        console.log("Failed to connect to MongoDB!");
    } else {
        const cursor = await db.findAllDoc(collectionName,errorHandler);
        const results = await cursor.toArray();
        for (const element of results) {
            const centerFilteredData = await slot.checkSlots(element, errorHandler);
            if (!element.hasOwnProperty("last_notified_ts") || element.last_notified_ts.toString().length == 0) {
                if (centerFilteredData.length > 0) {
                    const emailResponse = await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                    if (emailResponse) {
                        const notifiedTimestamp = await Date.now();
                        await console.log("Notification sent to " + element.email + " on " + new Date(notifiedTimestamp));
                        let result = await db.updateOneDoc({email: element.email},{
                            $set: {
                                last_notified_ts: notifiedTimestamp,
                            }}, collectionName, errorHandler);
                        if (result.modifiedCount > 0)
                            await console.log("Updated 'last_notified_ts' for " + element.email + " with " + notifiedTimestamp);
                    }
                }
            } else {
                let timeDiffInMins = await Math.abs((Date.now() - element.last_notified_ts) / (1000 * 60));
                switch (element.frequency) {
                    case "every 30 mins":
                        if (30 <= timeDiffInMins) {
                            if (centerFilteredData.length > 0) {
                                const emailResponse = await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                                if (emailResponse) {
                                    const notifiedTimestamp = await Date.now();
                                    await console.log("Notification sent to " + element.email + " on " + new Date(notifiedTimestamp));
                                    let result = await db.updateOneDoc({email: element.email},{
                                        $set: {
                                            last_notified_ts: notifiedTimestamp,
                                        }}, collectionName, errorHandler);
                                    if (result.modifiedCount > 0)
                                        await console.log("Updated 'last_notified_ts' for " + element.email + " with " + notifiedTimestamp);
                                }
                            }
                        }
                        break;
                    case "every hour":
                        if (60 <= timeDiffInMins) {
                            if (centerFilteredData.length > 0) {
                                const emailResponse = await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                                if (emailResponse) {
                                    const notifiedTimestamp = await Date.now();
                                    await console.log("Notification sent to " + element.email + " on " + new Date(notifiedTimestamp));
                                    let result = await db.updateOneDoc({email: element.email},{
                                        $set: {
                                            last_notified_ts: notifiedTimestamp,
                                        }}, collectionName, errorHandler);
                                    if (result.modifiedCount > 0)
                                        await console.log("Updated 'last_notified_ts' for " + element.email + " with " + notifiedTimestamp);
                                }
                            }
                        }
                        break;
                    case "every 3 hours":
                        if (180 <= timeDiffInMins) {
                            if (centerFilteredData.length > 0) {
                                const emailResponse = await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                                if (emailResponse) {
                                    const notifiedTimestamp = await Date.now();
                                    await console.log("Notification sent to " + element.email + " on " + new Date(notifiedTimestamp));
                                    let result = await db.updateOneDoc({email: element.email},{
                                        $set: {
                                            last_notified_ts: notifiedTimestamp,
                                        }}, collectionName, errorHandler);
                                    if (result.modifiedCount > 0)
                                        await console.log("Updated 'last_notified_ts' for " + element.email + " with " + notifiedTimestamp);
                                }
                            }
                        }
                        break;
                    case "every 6 hours":
                        if (360 <= timeDiffInMins) {
                            if (centerFilteredData.length > 0) {
                                const emailResponse = await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                                if (emailResponse) {
                                    const notifiedTimestamp = await Date.now();
                                    await console.log("Notification sent to " + element.email + " on " + new Date(notifiedTimestamp));
                                    let result = await db.updateOneDoc({email: element.email},{
                                        $set: {
                                            last_notified_ts: notifiedTimestamp,
                                        }}, collectionName, errorHandler);
                                    if (result.modifiedCount > 0)
                                        await console.log("Updated 'last_notified_ts' for " + element.email + " with " + notifiedTimestamp);
                                }
                            }
                        }
                        break;
                    case "every 12 hours":
                        if (720 <= timeDiffInMins) {
                            if (centerFilteredData.length > 0) {
                                const emailResponse = await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                                if (emailResponse) {
                                    const notifiedTimestamp = await Date.now();
                                    await console.log("Notification sent to " + element.email + " on " + new Date(notifiedTimestamp));
                                    let result = await db.updateOneDoc({email: element.email},{
                                        $set: {
                                            last_notified_ts: notifiedTimestamp,
                                        }}, collectionName, errorHandler);
                                    if (result.modifiedCount > 0)
                                        await console.log("Updated 'last_notified_ts' for " + element.email + " with " + notifiedTimestamp);
                                }
                            }
                        }
                        break;
                }
            }
        }
    }
});


// User verification during subscription
let verifyToken = async (request, response, next) => {
    if (request.params.token != null) {
        try {
            let authenticatedData = await jwt.verify(request.params.token, process.env.ACCESS_TOKEN_SECRET);
            request.authenticatedData = authenticatedData;
            await next();
        } catch (error) {
            await errorHandler(error);
            await response.sendStatus(403);
        }
    }
};


// Handling server side requests and responses
app.get("/", async (request,response) => {
    if (request.query.verifyMsg)
        await console.log(request.query.verifyMsg);
    await response.sendFile(path.join(static_path, "/index.html"));
});
app.get("/district_list", async (request,response) => {
    let promised_district_data = await cowin.getAllDistricts(errorHandler);
    await response.send(promised_district_data);
});
app.get("/action/:token", verifyToken, async (request,response) => {
    if (request.authenticatedData != null) {
        let result = await db.findOneDoc({email: request.authenticatedData.user.email}, collectionName, errorHandler);
        let verifyMsg = "";
        if (result && result.hasOwnProperty("_id")) {
            verifyMsg = await encodeURIComponent("User already subscribed");
            await response.redirect("/?verifyMsg=" + verifyMsg);
        } else {
            result = await db.insertOneDoc({
                email: request.authenticatedData.user.email,
                frequency: request.authenticatedData.user.frequency,
                age: request.authenticatedData.user.age,
                location: request.authenticatedData.user.location,
                location_value: request.authenticatedData.user.location_value,
            }, collectionName, errorHandler);
            if (result.insertedCount >= 1) {
                verifyMsg = encodeURIComponent("User successfully subscribed to receive email notification!");
                await response.redirect("/?verifyMsg=" + verifyMsg);
            } else
                await response.redirect("/");
        }
    } else await response.redirect("/");
});
app.post("/action", async (request,response) => {
    console.log(request.body);
    try {
        if (undefined == await db.getDb(errorHandler)) {
            await response.send("");
        } else {
            if (request.body.subscribe != null) {
                let result = await db.findOneDoc({email: request.body.email}, collectionName, errorHandler);
                if (!result) {
                    const token = await jwt.sign({user: request.body}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30m'});
                    const tokenData = `<h3>Please click on below link to start receiving vaccine notifications</h3>
                                       <p>(Link valid for only 30 min)</p>
                                       <a href="` + process.env.CLIENT_URL + `/action/` + token + `">` + process.env.CLIENT_URL + `/action/` + token + `</a>`;
                    const emailResponse = await email.emailVerifier(request.body.email, tokenData, errorHandler);
                    if (emailResponse) {
                        await response.send("A verification email has been sent to " + request.body.email + " | Kindly activate to receive vaccine notifications " + request.body.frequency);
                    }
                } else if (result && result.hasOwnProperty("_id")) {
                    result = await db.updateOneDoc({email: request.body.email}, {
                        $set: {
                            frequency: request.body.frequency,
                            age: request.body.age,
                            location: request.body.location,
                            location_value: request.body.location_value,
                        }
                    }, collectionName, errorHandler);
                    if (result.modifiedCount > 0)
                        await response.send("Updated notification preferences for " + request.body.email + " | User already subscribed!");
                    else if (result.modifiedCount == 0 && result.matchedCount > 0)
                        await response.send("User already subscribed");
                    else
                        await response.send("");
                } else
                    await response.send("");
            } else if (request.body.unsubscribe != null) {
                let result = await db.findOneDoc({email: request.body.email}, collectionName, errorHandler);
                if (result == null) {
                    await response.send(request.body.email + " is not subscribed to email notification");
                } else if (result && result.hasOwnProperty("_id")) {
                    result = await db.deleteManyDoc({email: request.body.email}, collectionName, errorHandler);
                    if (result.deletedCount >= 1)
                        await response.send(request.body.email + " unsubscribed from email notification!");
                    else
                        await response.send("");
                } else
                    await response.send("");
            } else if (request.body.check_availability != null) {
                let centerFilteredData = await slot.checkSlots(request.body, errorHandler);
                if (centerFilteredData.length)
                    await response.send(await content.webContentFormatter(centerFilteredData));
                else
                    await response.send("");
            } else
                await response.send("");
        }
    } catch (error) {
        errorHandler(error);
        await response.send("");
    }
});




// Run application server
const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log("Server is running at port: "+ port);
});

// Connect to MongoDB
db.dbConnect(errorHandler).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log(error);
});
