const cron = require('node-cron')
    , slot = require("./slot")
    , db = require( './db' )
    , bot = require('./bot')
    , email = require("./email")
    , telegramCollectionName = "telegram_users"
    , emailCollectionName = "users";


// Send periodic notifications to telegram subscribers with age < 45 every 10 mins
let telegram18Cron = async (errorHandler) => {
    await cron.schedule("*/10 * * * *", async () => {
        try {
            await console.log("telegram 18 cron running at: " + new Date(Date.now()));
            if (undefined == await db.getDb(errorHandler)) {
                console.log("Failed to connect to MongoDB!");
            } else {
                const cursor = await db.findAllDoc({age: {$lt: 45}},telegramCollectionName,errorHandler);
                const results = await cursor.toArray();
                for (const element of results) {
                    const centerFilteredData = await slot.checkSlots(element, errorHandler);
                    if (centerFilteredData.length > 0) {
                        await bot.botNotifier(element.from_id, centerFilteredData, errorHandler);
                        const notifiedTimestamp = await Date.now();
                        await console.log("Notification sent to " + element.from_id + " on " + new Date(notifiedTimestamp));
                        let result = await db.updateOneDoc({from_id: element.from_id},{
                            $set: {
                                last_notified_ts: notifiedTimestamp,
                            }}, telegramCollectionName, errorHandler);
                        if (result.modifiedCount > 0)
                            await console.log("Updated 'last_notified_ts' for " + element.from_id + " with " + notifiedTimestamp);
                    }
                }
            }
        } catch (error) {
            errorHandler(error);
        }
    });
};

// Send periodic notifications to telegram subscribers with age >= 45 based on preference
let telegram45Cron = async (errorHandler) => {
    await cron.schedule("*/5 * * * *", async () => {
        try {
            await console.log("telegram 45 cron running at: " + new Date(Date.now()));
            if (undefined == await db.getDb(errorHandler)) {
                console.log("Failed to connect to MongoDB!");
            } else {
                const cursor = await db.findAllDoc({age: {$gte: 45}}, telegramCollectionName, errorHandler);
                const results = await cursor.toArray();
                for (const element of results) {
                    const centerFilteredData = await slot.checkSlots(element, errorHandler);
                    if (!element.hasOwnProperty("last_notified_ts") || element.last_notified_ts.toString().length == 0) {
                        if (centerFilteredData.length > 0) {
                            await bot.botNotifier(element.from_id, centerFilteredData, errorHandler);
                            const notifiedTimestamp = await Date.now();
                            await console.log("Notification sent to " + element.from_id + " on " + new Date(notifiedTimestamp));
                            let result = await db.updateOneDoc({from_id: element.from_id}, {
                                $set: {
                                    last_notified_ts: notifiedTimestamp,
                                }
                            }, telegramCollectionName, errorHandler);
                            if (result.modifiedCount > 0)
                                await console.log("Updated 'last_notified_ts' for " + element.from_id + " with " + notifiedTimestamp);
                        }
                    } else {
                        let timeDiffInMins = await Math.abs((Date.now() - element.last_notified_ts) / (1000 * 60));
                        switch (element.frequency) {
                            case "every 30 mins":
                                if (30 <= timeDiffInMins) {
                                    if (centerFilteredData.length > 0) {
                                        await bot.botNotifier(element.from_id, centerFilteredData, errorHandler);
                                        const notifiedTimestamp = await Date.now();
                                        await console.log("Notification sent to " + element.from_id + " on " + new Date(notifiedTimestamp));
                                        let result = await db.updateOneDoc({from_id: element.from_id}, {
                                            $set: {
                                                last_notified_ts: notifiedTimestamp,
                                            }
                                        }, telegramCollectionName, errorHandler);
                                        if (result.modifiedCount > 0)
                                            await console.log("Updated 'last_notified_ts' for " + element.from_id + " with " + notifiedTimestamp);
                                    }
                                }
                                break;
                            case "every hour":
                                if (60 <= timeDiffInMins) {
                                    if (centerFilteredData.length > 0) {
                                        await bot.botNotifier(element.from_id, centerFilteredData, errorHandler);
                                        const notifiedTimestamp = await Date.now();
                                        await console.log("Notification sent to " + element.from_id + " on " + new Date(notifiedTimestamp));
                                        let result = await db.updateOneDoc({from_id: element.from_id}, {
                                            $set: {
                                                last_notified_ts: notifiedTimestamp,
                                            }
                                        }, telegramCollectionName, errorHandler);
                                        if (result.modifiedCount > 0)
                                            await console.log("Updated 'last_notified_ts' for " + element.from_id + " with " + notifiedTimestamp);
                                    }
                                }
                                break;
                            case "every 3 hours":
                                if (180 <= timeDiffInMins) {
                                    if (centerFilteredData.length > 0) {
                                        await bot.botNotifier(element.from_id, centerFilteredData, errorHandler);
                                        const notifiedTimestamp = await Date.now();
                                        await console.log("Notification sent to " + element.from_id + " on " + new Date(notifiedTimestamp));
                                        let result = await db.updateOneDoc({from_id: element.from_id}, {
                                            $set: {
                                                last_notified_ts: notifiedTimestamp,
                                            }
                                        }, telegramCollectionName, errorHandler);
                                        if (result.modifiedCount > 0)
                                            await console.log("Updated 'last_notified_ts' for " + element.from_id + " with " + notifiedTimestamp);
                                    }
                                }
                                break;
                            case "every 6 hours":
                                if (360 <= timeDiffInMins) {
                                    if (centerFilteredData.length > 0) {
                                        await bot.botNotifier(element.from_id, centerFilteredData, errorHandler);
                                        const notifiedTimestamp = await Date.now();
                                        await console.log("Notification sent to " + element.from_id + " on " + new Date(notifiedTimestamp));
                                        let result = await db.updateOneDoc({from_id: element.from_id}, {
                                            $set: {
                                                last_notified_ts: notifiedTimestamp,
                                            }
                                        }, telegramCollectionName, errorHandler);
                                        if (result.modifiedCount > 0)
                                            await console.log("Updated 'last_notified_ts' for " + element.from_id + " with " + notifiedTimestamp);
                                    }
                                }
                                break;
                            case "every 12 hours":
                                if (720 <= timeDiffInMins) {
                                    if (centerFilteredData.length > 0) {
                                        await bot.botNotifier(element.from_id, centerFilteredData, errorHandler);
                                        const notifiedTimestamp = await Date.now();
                                        await console.log("Notification sent to " + element.from_id + " on " + new Date(notifiedTimestamp));
                                        let result = await db.updateOneDoc({from_id: element.from_id}, {
                                            $set: {
                                                last_notified_ts: notifiedTimestamp,
                                            }
                                        }, telegramCollectionName, errorHandler);
                                        if (result.modifiedCount > 0)
                                            await console.log("Updated 'last_notified_ts' for " + element.from_id + " with " + notifiedTimestamp);
                                    }
                                }
                                break;
                        }
                    }
                }
            }
        } catch (error) {
            errorHandler(error);
        }
    });
};

// Send periodic notifications to all subscribers
let emailCron = async (errorHandler) => {
    await cron.schedule("*/1 * * * *", async () => {
        try {
            await console.log("email cron running at: " + new Date(Date.now()));
            if (undefined == await db.getDb(errorHandler)) {
                console.log("Failed to connect to MongoDB!");
            } else {
                const cursor = await db.findAllDoc({},emailCollectionName,errorHandler);
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
                                    }}, emailCollectionName, errorHandler);
                                if (result.modifiedCount > 0)
                                    await console.log("Updated 'last_notified_ts' for " + element.email + " with " + notifiedTimestamp);
                            }
                        }
                    } else {
                        let timeDiffInMins = await Math.abs((Date.now() - element.last_notified_ts) / (1000 * 60));
                        switch (element.frequency) {
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
                                                }}, emailCollectionName, errorHandler);
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
                                                }}, emailCollectionName, errorHandler);
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
                                                }}, emailCollectionName, errorHandler);
                                            if (result.modifiedCount > 0)
                                                await console.log("Updated 'last_notified_ts' for " + element.email + " with " + notifiedTimestamp);
                                        }
                                    }
                                }
                                break;
                            case "every day":
                                if (1440 <= timeDiffInMins) {
                                    if (centerFilteredData.length > 0) {
                                        const emailResponse = await email.emailNotifier(element.email, centerFilteredData, errorHandler);
                                        if (emailResponse) {
                                            const notifiedTimestamp = await Date.now();
                                            await console.log("Notification sent to " + element.email + " on " + new Date(notifiedTimestamp));
                                            let result = await db.updateOneDoc({email: element.email},{
                                                $set: {
                                                    last_notified_ts: notifiedTimestamp,
                                                }}, emailCollectionName, errorHandler);
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
        } catch (error) {
            errorHandler(error);
        }
    });
};




module.exports = { emailCron, telegram18Cron, telegram45Cron };