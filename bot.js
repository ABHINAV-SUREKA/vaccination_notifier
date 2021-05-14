const Telegraf = require("telegraf")
    , bot = new Telegraf.Telegraf(process.env.TELEGRAM_BOT_TOKEN, {polling: true})
    , db = require( './db' )
    , slot = require("./slot")
    , content = require('./email_content')
    , collectionName = "telegram_users";
let errorHandler = (error) => { console.log("Error encountered: " + error); }
const welcomeMessage = `
Hi! \u{1f596} I am Find Vacc Bot.
I will help you to:
1) Find available vaccine slot
2) Notify you of available vaccine slot

Please input <b>age</b> and <b>location</b>`;
const helpMessage = `
\u{2753} Help
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
`;
const ageMessage = "Please enter desired age";
const locationMessage = "Please select desired location";
const pinMessage = "Please enter desired pincode";
const stateMessage = "Please enter desired state";
const mainMessage = "Please select an operation";

const mainKeyboard = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
        inline_keyboard: [
            [{text: "\u{1F50D} Check available slots", callback_data: 'check slot'}],
            [{text: "\u{1F514} Notify me of available slots", callback_data: 'notify slot'}],
            [{text: "\u{2753} Help", callback_data: 'help'}, {text: "\u{1F50F} Privacy Policy", callback_data: 'privacy policy'}],
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

let startMiddleware = async (context,next) => {
    let result = await db.findOneDoc({from_id: context.from.id}, collectionName, errorHandler);
    if (!result) {
        await db.insertOneDoc({
            from_id: context.from.id,
        }, collectionName, errorHandler);
    }
    next();
};