const mongoClient = require("mongodb");
var url = "mongodb://localhost:27017/users"

mongoClient.connect(url,(error, result) => {
    if (error)
        throw error;
    console.log("Database created");
    result.close();
});