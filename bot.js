const Telegraf = require("telegraf")
    , bot = new Telegraf.Telegraf(process.env.TELEGRAM_BOT_TOKEN, {polling: true})
    , db = require( './db' )
    , slot = require("./slot")
    , cowin = require("./cowin")
    , content = require('./bot_content')
    , telegramCollectionName = "telegram_users";

let errorHandler = (error) => { console.log("Error encountered: " + error); }
const welcomeMessage = `
Hi! \u{1f596} I am <b>Find Vacc Bot</b>.
I will help you to:
1) Find available vaccine slot
2) Notify you of available vaccine slot

Please input <b>age</b> and <b>location</b>`
    , privacyMessage = `
\u{1F50F} <b>Find Vacc Bot</b> does not store or access any personal information except:

 1) The age and location preferences set by you.
 2) Your telegram user id to uniquely identify you and send results based on your preferences.
 
To delete all your information, click <b>/delete</b> or type <b>delete</b>
`
    , helpMessage = `
\u{2753} Help
<b>Start</b>
To start the bot again, click <b>/start</b>

<b>Help</b>
To get help window, click <b>/help</b> or type <b>help</b>

<b>Privacy Policy</b>
To read privacy policy window, click <b>/privacy</b> or type <b>privacy</b>

<b>Find Slot</b>
To check for an available vaccination slot, click <b>/checkslot</b> or type <b>checkslot</b>

<b>Notify Slot</b>
To get periodically notified of an available vaccination slot , click <b>/notifyslot</b> or type <b>notifyslot</b>

<b>Age Preference</b>
To change age preference, click <b>/age</b> or type <b>age</b>

<b>Location Preference</b>
To change location preference, click <b>/location</b> or type <b>location</b>

<b>Frequency Preference</b>
To change frequency of periodic notifications, click <b>/frequency</b> or type <b>frequency</b>

<b>Delete</b>
To delete all your information, click <b>/delete</b> or type <b>delete</b>
`
    , ageMessage = "Please enter desired age"
    , locationMessage = "Please select desired location"
    , pinMessage = "Please enter desired pincode"
    , stateMessage = "Please select desired state"
    , stateFailureMessage = "Couldn't fetch state list at present. Please try other option."
    , districtMessage = "Please select desired district"
    , districtFailureMessage = "Couldn't fetch district list at present. Please try other option."
    , frequencyMessage = "Please select desired frequency for notifications"
    , mainMessage = "Please select an operation"
    , deleteMessage = "Your preferences have been deleted"
    , noSlotsMessage = "No slots available. Check again in sometime"
    , slotsAvailableMessage = "Slots fetched successfully. Time to visit https://selfregistration.cowin.gov.in"
    , noRecordsMessage = "No records found"
    , startMessage = "Click /start to start again";

const mainKeyboard = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
        inline_keyboard: [
            [{text: "\u{1F50D} Check available slots", callback_data: 'check slot'}],
            [{text: "\u{1F514} Notify me of available slots", callback_data: 'notify slot'}],
            [{text: "\u{1F468} Edit age", callback_data: 'age'}, {text: "\u{1F4CD} Edit location", callback_data: 'location'}],
            [{text: "\u{2753} Help", callback_data: 'help'}, {text: "\u{1F50F} Privacy Policy", callback_data: 'privacy'}],
        ],
    }
};
const preferencesKeyboard = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
        inline_keyboard: [
            [{text: "Age", callback_data: 'age'}, {text: "Location", callback_data: 'location'}],
        ],
    }
};
const locationKeyboard = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
        inline_keyboard: [
            [{text: "Pincode", callback_data: 'pincode'}, {text: "District", callback_data: 'district'}],
        ],
    }
};
const frequencyKeyboard = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
        inline_keyboard: [
            [{text: "Every 30 mins", callback_data: 'every 30 mins'}],
            [{text: "Hourly", callback_data: 'every hour'}],
            [{text: "Every 3 hours", callback_data: 'every 3 hours'}],
            [{text: "Every 6 hours", callback_data: 'every 6 hours'}],
            [{text: "Every 12 hours", callback_data: 'every 12 hours'}],
        ],
    }
};
let dynamicKeyboard = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
        inline_keyboard: [],
    }
};

let startMiddleware = async (context,next) => {
    try {
        let result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
        if (!result) {
            await db.insertOneDoc({
                from_id: context.from.id,
            }, telegramCollectionName, errorHandler);
        }
        await next();
    } catch (error) {
        await errorHandler(error);
    }
};
let ageMiddleware = async (context,next) => {
    try {
        let result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
        if (result && result.hasOwnProperty("_id")) {
            result = await db.updateOneDoc({from_id: context.from.id}, {
                $set: {
                    age: parseInt(context.match.input),
                }
            }, telegramCollectionName, errorHandler);
            if (result.modifiedCount > 0)
                await context.reply("Updated age preference to " + context.match.input);
            else if (result.modifiedCount == 0 && result.matchedCount > 0)
                await context.reply("Age preference already set to " + context.match.input);
            result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
            if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("age") && !result.hasOwnProperty("location_value")) {
                await context.reply(locationMessage, locationKeyboard);
            } else if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("age") && result.hasOwnProperty("location_value")) {
                await context.reply(mainMessage, mainKeyboard);
            }
        } else {
            await context.reply(noRecordsMessage);
            await context.reply(startMessage);
        }
        await next();
    } catch (error) {
        await errorHandler(error);
    }
};
let pinMiddleware = async (context,next) => {
    try {
        let result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
        if (result && result.hasOwnProperty("_id")) {
            result = await db.updateOneDoc({from_id: context.from.id}, {
                $set: {
                    location: "pincode",
                    location_value: context.match.input,
                }
            }, telegramCollectionName, errorHandler);
            if (result.modifiedCount > 0)
                await context.reply("Updated location preference to pincode " + context.match.input);
            else if (result.modifiedCount == 0 && result.matchedCount > 0)
                await context.reply("Location preference already set to pincode " + context.match.input);
            result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
            if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("location_value") && !result.hasOwnProperty("age")) {
                await context.reply(ageMessage);
            } else if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("age") && result.hasOwnProperty("location_value")){
                await context.reply(mainMessage, mainKeyboard);
            }
        } else {
            await context.reply(noRecordsMessage);
            await context.reply(startMessage);
        }
        await next();
    } catch (error) {
        await errorHandler(error);
    }
};
let stateMiddleware = async (context,next) => {
    try {
        await context.deleteMessage(); // deletes original message before sending another
        let promised_state_data = await cowin.getStates(errorHandler);
        if (promised_state_data && promised_state_data.states) {
            let dynamicKeyboardData = await promised_state_data.states.map((state) => {
                return [{text: state.state_name, callback_data: "state " + state.state_id}];
            });
            dynamicKeyboard.reply_markup.inline_keyboard = [];
            dynamicKeyboard.reply_markup.inline_keyboard = dynamicKeyboardData;
            await context.reply(stateMessage, dynamicKeyboard);
        } else {
            await context.reply(stateFailureMessage, mainKeyboard);
        }
        await next();
    } catch(error) {
        await errorHandler(error);
    }
};
let districtMiddleware = async(context,next) => {
    try {
        await context.deleteMessage();
        let promised_district_data = await cowin.getDistricts(context.match.input.split(" ")[1], errorHandler);
        if (promised_district_data && promised_district_data.districts) {
            let dynamicKeyboardData = await promised_district_data.districts.map((district) => {
                return [{text: district.district_name, callback_data: "district " + district.district_id}];
            });
            dynamicKeyboard.reply_markup.inline_keyboard = [];
            dynamicKeyboard.reply_markup.inline_keyboard = dynamicKeyboardData;
            await context.reply(districtMessage, dynamicKeyboard);
        } else {
            await context.reply(districtFailureMessage, mainKeyboard);
        }
        await next();
    } catch(error) {
        await errorHandler(error);
    }
};
let districtMiddleware2 = async(context,next) => {
    try {
        await context.deleteMessage();
        let result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
        if (result && result.hasOwnProperty("_id")) {
            result = await db.updateOneDoc({from_id: context.from.id}, {
                $set: {
                    location: "district",
                    location_value: context.match.input.split(" ")[1],
                }
            }, telegramCollectionName, errorHandler);
            if (result.modifiedCount > 0)
                await context.reply("Updated location preference to district id " + context.match.input.split(" ")[1]);
            else if (result.modifiedCount == 0 && result.matchedCount > 0)
                await context.reply("Location preference already set to district id " + context.match.input.split(" ")[1]);
            result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
            if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("location_value") && !result.hasOwnProperty("age")) {
                await context.reply(ageMessage);
            } else if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("age") && result.hasOwnProperty("location_value")){
                await context.reply(mainMessage, mainKeyboard);
            }
        } else {
            await context.reply(noRecordsMessage);
            await context.reply(startMessage);
        }
        await next();
    } catch (error) {
        await errorHandler(error);
    }
};
let checkSlotMiddleware = async (context,next) => {
    try {
        if (context.update.callback_query)
            await context.answerCbQuery();
        let result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
        if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("age") && result.hasOwnProperty("location_value")) {
            await context.reply("Checking available vaccination slots for age " + result.age + " and " + result.location + " " + result.location_value);
            const centerFilteredData = await slot.checkSlots(result, errorHandler);
            if (centerFilteredData.length > 0) {
                const data = await content.botContentFormatter(centerFilteredData);
                const numChunks = Math.ceil(data.html.length / 4096);
                for (let i = 0; i < numChunks; i++) {
                    if ((i * 4096 + 4096) > data.html.length)
                        await context.reply(data.html.substring(i * 4096, data.html.length));
                    else
                        await context.reply(data.html.substring(i * 4096, i * 4096 + 4096));
                }
                await context.reply(slotsAvailableMessage, mainKeyboard);
            } else {
                await context.reply(noSlotsMessage, mainKeyboard);
            }
        } else if (result && result.hasOwnProperty("_id") && !result.hasOwnProperty("age")) {
            await context.reply(ageMessage);
        } else if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("age") && !result.hasOwnProperty("location_value")) {
            await context.reply(locationMessage, locationKeyboard);
        }
        await next();
    } catch (error) {
        await errorHandler(error);
    }
};
let frequencyMiddleware = async (context,next) => {
    try {
        if (context.update.callback_query)
            await context.answerCbQuery();
        let result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
        if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("age")) {
            if (parseInt(result.age) >= 45)
                await context.reply(frequencyMessage, frequencyKeyboard);
            else {
                await context.reply("You will be notified of available slots for age " + result.age + " as frequently as possible");
                await context.reply(mainMessage, mainKeyboard);
            }
        } else if (result && result.hasOwnProperty("_id") && !result.hasOwnProperty("age")) {
            await context.reply(ageMessage);
        }
        await next();
    } catch (error) {
        await errorHandler(error);
    }
};
let notifySlotMiddleware = async (context,next) => {
    try {
        await context.deleteMessage();
        let result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
        if (result && result.hasOwnProperty("_id")) {
            result = await db.updateOneDoc({from_id: context.from.id}, {
                $set: {
                    frequency: context.match.input,
                }
            }, telegramCollectionName, errorHandler);
            if (result.modifiedCount > 0)
                await context.reply("Updated frequency preference to " + context.match.input);
            else if (result.modifiedCount == 0 && result.matchedCount > 0)
                await context.reply("Frequency preference already set to " + context.match.input);
        }
        result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
        if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("age") && result.hasOwnProperty("location_value") && result.hasOwnProperty("frequency")) {
            await context.reply("You will be notified of available vaccination slots " + result.frequency + " for age " + result.age + " and " + result.location + " " + result.location_value);
            await context.reply(mainMessage, mainKeyboard);
        } else if (result && result.hasOwnProperty("_id") && !result.hasOwnProperty("age")) {
            await context.reply(ageMessage);
        } else if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("age") && !result.hasOwnProperty("location_value")) {
            await context.reply(locationMessage, locationKeyboard);
        } else if (result && result.hasOwnProperty("_id") && result.hasOwnProperty("age") && result.hasOwnProperty("location_value") && !result.hasOwnProperty("frequency")) {
            await context.reply(frequencyMessage, frequencyKeyboard);
        }
        await next();
    } catch (error) {
        await errorHandler(error);
    }
};
let deleteMiddleware = async (context,next) => {
    try {
        let result = await db.findOneDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
        if (result) {
            await db.deleteManyDoc({from_id: context.from.id}, telegramCollectionName, errorHandler);
            await context.reply(deleteMessage);
            await context.reply(startMessage);
        } else {
            await context.reply("Nothing to be deleted");
            await context.reply(startMessage);
        }
        await next();
    } catch (error) {
        await errorHandler(error);
    }
};

// all
bot.use(async (context, next) => {
    //await logger(context);
    await next(context); // this middleware function calls the next middleware function which is inside bot.start() in this case
});
// start
bot.start(startMiddleware, async (context) => {
    await context.reply(welcomeMessage, preferencesKeyboard); // another way to send message: bot.telegram.sendMessage(context.chat.id, text)
    await console.log(context.from.id);
});
// check slot
bot.action("check slot", checkSlotMiddleware, async (context) => {
    await console.log(context.from.id);
});
bot.command(["checkslot","Checkslot","CHECKSLOT"], checkSlotMiddleware, async (context) => {
    await console.log(context.from.id);
});
bot.hears(["checkslot","Checkslot","CHECKSLOT"], checkSlotMiddleware, async (context) => {
    await console.log(context.from.id);
});
// notify slot
bot.action("notify slot", frequencyMiddleware, async (context) => {
    await console.log(context.from.id);
});
bot.command(["notifyslot","Notifyslot","NOTIFYSLOT"], frequencyMiddleware, async (context) => {
    await console.log(context.from.id);
});
bot.hears(["notifyslot","Notifyslot","NOTIFYSLOT"], frequencyMiddleware, async (context) => {
    await console.log(context.from.id);
});
// frequency
bot.command(["frequency","Frequency","FREQUENCY"], frequencyMiddleware, async (context) => {
    await console.log(context.from.id);
});
bot.hears(["frequency","Frequency","FREQUENCY"], frequencyMiddleware, async (context) => {
    await console.log(context.from.id);
});
// age
bot.action("age", async (context) => {
    await context.answerCbQuery();
    await console.log(context.from.id);
    await context.reply(ageMessage);
});
bot.command(["age","Age","AGE"], async (context) => {
    console.log(context);
    await context.reply(ageMessage);
});
bot.hears(["age","Age","AGE"], async (context) => {
    console.log(context);
    await context.reply(ageMessage);
});
// input age
bot.hears(/^\d{1,3}$/, ageMiddleware, async (context) => {
    await console.log(context.from.id);
});
// location
bot.action("location", async (context) => {
    await context.answerCbQuery();
    await console.log(context.from.id);
    await context.reply(locationMessage, locationKeyboard);
});
bot.command(["location","Location","LOCATION"], async (context) => {
    await console.log(context.from.id);
    await context.reply(locationMessage, locationKeyboard);
});
bot.hears(["location","Location","LOCATION"], async (context) => {
    await console.log(context.from.id);
    await context.reply(locationMessage, locationKeyboard);
});
// pincode
bot.action("pincode", async (context) => {
    await context.answerCbQuery();
    await console.log(context.from.id);
    await context.reply(pinMessage);
});
bot.command(["pincode","Pincode","PINCODE"], async (context) => {
    await console.log(context.from.id);
    await context.reply(pinMessage);
});
bot.hears(["pincode","Pincode","PINCODE"], async (context) => {
    await console.log(context.from.id);
    await context.reply(pinMessage);
});
// input pincode
bot.hears(/^\d{6}$/, pinMiddleware, async (context) => {
    await console.log(context.from.id);
});
// district
bot.action("district", stateMiddleware, async (context) => {
    await console.log(context.from.id);
});
bot.command(["district","District","DISTRICT"], stateMiddleware, async (context) => {
    await console.log(context.from.id);
});
bot.hears(["district","District","DISTRICT"], stateMiddleware, async (context) => {
    await console.log(context.from.id);
});
// select state
bot.action(/^state \d{1,2}$/, districtMiddleware, async (context) => {
    await console.log(context.from.id);
});
// select district
bot.action(/^district \d{1,3}$/, districtMiddleware2, async (context) => {
    await console.log(context.from.id);
});
// select frequency
bot.action(["every 30 mins","every hour","every 3 hours","every 6 hours","every 12 hours"], notifySlotMiddleware, async (context) => {
    await console.log(context.from.id);
});
// help
bot.action("help", async (context) => {
    await context.answerCbQuery();
    await console.log(context.from.id);
    await context.reply(helpMessage, {
        parse_mode: "HTML",
        disable_notification: true
    });
    await context.reply(mainMessage, mainKeyboard);
});
bot.command(["help","Help","HELP"], async (context) => {
    await console.log(context.from.id);
    await context.reply(helpMessage, {
        parse_mode: "HTML",
        disable_notification: true
    });
    await context.reply(mainMessage, mainKeyboard);
});
bot.hears(["help","Help","HELP"], async (context) => {
    await console.log(context.from.id);
    await context.reply(helpMessage, {
        parse_mode: "HTML",
        disable_notification: true
    });
    await context.reply(mainMessage, mainKeyboard);
});
bot.help(async (context) => {
    await console.log(context.from.id);
    await context.reply(helpMessage, {
        parse_mode: "HTML",
        disable_notification: true
    });
    await context.reply(welcomeMessage, mainKeyboard);
});
// privacy policy
bot.action("privacy", async (context) => {
    await context.answerCbQuery();
    await console.log(context.from.id);
    await context.reply(privacyMessage, {
        parse_mode: "HTML",
        disable_notification: true
    });
    await context.reply(mainMessage, mainKeyboard);
});
bot.command(["privacy", "Privacy", "PRIVACY", "privacy policy", "Privacy policy"], async (context) => {
    await console.log(context.from.id);
    await context.reply(privacyMessage, {
        parse_mode: "HTML",
        disable_notification: true
    });
    await context.reply(mainMessage, mainKeyboard);
});
bot.hears(["privacy", "Privacy", "PRIVACY", "privacy policy", "Privacy policy"], async (context) => {
    await console.log(context.from.id);
    await context.reply(privacyMessage, {
        parse_mode: "HTML",
        disable_notification: true
    });
    await context.reply(mainMessage, mainKeyboard);
});
// delete
bot.command(["delete", "Delete", "DELETE"], deleteMiddleware, async (context) => {
    await console.log(context.from.id);
});
bot.hears(["delete", "Delete", "DELETE"], deleteMiddleware, async (context) => {
    await console.log(context.from.id);
});

// bot kare bakc**di
bot.on("sticker", (context) => context.reply('👍'));

// Send bot notification
let botNotifier = async (toId,centerFilteredData,errorHandler) => { // will be called only when centerFilteredData is not empty
    try {
        const data = await content.botContentFormatter(centerFilteredData);
        const numChunks = Math.ceil(data.html.length / 4096);
        for (let i = 0; i < numChunks; i++) {
            if ((i * 4096 + 4096) > data.html.length)
                await bot.telegram.sendMessage(toId, data.html.substring(i * 4096, data.html.length));
            else
                await bot.telegram.sendMessage(toId, data.html.substring(i * 4096, i * 4096 + 4096));
        }
        await bot.telegram.sendMessage(toId, slotsAvailableMessage, mainKeyboard);
    } catch (error) {
        errorHandler(error);
        throw new Error("Error sending message");
    }
}

// Connect to Telegram bot
let botConnect = async (errorHandler) => {
    try {
        await bot.launch();
    } catch (error) {
        await errorHandler(error);
        throw new Error("Failed to connect to Telegram Bot!");
    }
}

module.exports = { botConnect, botNotifier };