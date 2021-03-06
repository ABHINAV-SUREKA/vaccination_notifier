const MongoClient = require("mongodb").MongoClient
    , dotenv = require('dotenv')
    , uri = process.env.DB_URI  // for running in local machine, change to: uri = "mongodb://localhost:27017"
    , dbName = "Users";

dotenv.config();
var database;


let dbConnect = async (errorHandler) => {
    let client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    try {
        await client.connect();
        database = client.db(dbName);
    } catch (error) {
        errorHandler(error);
        throw new Error("Failed to connect to MongoDB!");
    }
}

let getDb = async (errorHandler) => {
    try {
        return await database;
    } catch (error) {
        errorHandler(error);
    }
}

let findOneDoc = async (findCondition,collectionName,errorHandler) => {
    try {
        return database.collection(collectionName).findOne(findCondition);
    } catch (error) {
        errorHandler(error);
    }
}

let findAllDoc = async (findCondition,collectionName,errorHandler) => {
    try {
        return database.collection(collectionName).find(findCondition);
    } catch (error) {
        errorHandler(error);
    }
}

let insertOneDoc = async (newDoc,collectionName,errorHandler) => {
    try {
        return await database.collection(collectionName).insertOne(newDoc);
    } catch (error) {
        errorHandler(error);
    }
}

let updateOneDoc = async (findCondition,updatedDoc,collectionName,errorHandler) => {
    try {
        return await database.collection(collectionName).updateOne(findCondition,updatedDoc);
    } catch (error) {
        errorHandler(error);
    }
}

let deleteManyDoc = async (findCondition,collectionName,errorHandler) => {
    try {
        return await database.collection(collectionName).deleteMany(findCondition);
    } catch (error) {
        errorHandler(error);
    }
}


module.exports = { dbConnect, getDb, findOneDoc, findAllDoc, insertOneDoc, updateOneDoc, deleteManyDoc };
