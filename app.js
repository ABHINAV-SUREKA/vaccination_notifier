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
    , bot = require('./bot')
    , content = require('./web_content')
    , crons = require('./crons')
    , emailCollectionName = "users";

dotenv.config();
app.use(express.static(static_path));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
let errorHandler = (error) => { console.log("Error encountered: " + error); }


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
        let result = await db.findOneDoc({email: request.authenticatedData.user.email}, emailCollectionName, errorHandler);
        let verifyMsg = "";
        if (result && result.hasOwnProperty("_id")) {
            verifyMsg = await encodeURIComponent("User already subscribed");
            await response.redirect("/?verifyMsg=" + verifyMsg);
        } else {
            result = await db.insertOneDoc({
                email: request.authenticatedData.user.email,
                frequency: request.authenticatedData.user.frequency,
                age: parseInt(request.authenticatedData.user.age),
                location: request.authenticatedData.user.location,
                location_value: request.authenticatedData.user.location_value,
            }, emailCollectionName, errorHandler);
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
                let result = await db.findOneDoc({email: request.body.email}, emailCollectionName, errorHandler);
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
                            age: parseInt(request.body.age),
                            location: request.body.location,
                            location_value: request.body.location_value,
                        }
                    }, emailCollectionName, errorHandler);
                    if (result.modifiedCount > 0)
                        await response.send("Updated notification preferences for " + request.body.email + " | User already subscribed!");
                    else if (result.modifiedCount == 0 && result.matchedCount > 0)
                        await response.send("User already subscribed");
                    else
                        await response.send("");
                } else
                    await response.send("");
            } else if (request.body.unsubscribe != null) {
                let result = await db.findOneDoc({email: request.body.email}, emailCollectionName, errorHandler);
                if (result == null) {
                    await response.send(request.body.email + " is not subscribed to email notification");
                } else if (result && result.hasOwnProperty("_id")) {
                    result = await db.deleteManyDoc({email: request.body.email}, emailCollectionName, errorHandler);
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

// Connect to Telegram Bot
bot.botConnect(errorHandler).then(() => {
    console.log("Connected to Telegram Bot")
}).catch((error) => {
    console.log(error);
});

// Start Email Cron
crons.emailCron(errorHandler).catch((error) => {
    console.log(error);
});

// Start Telegram 18 Cron
crons.telegram18Cron(errorHandler).catch((error) => {
    console.log(error);
});

// Start Telegram 45 Cron
crons.telegram45Cron(errorHandler).catch((error) => {
    console.log(error);
});