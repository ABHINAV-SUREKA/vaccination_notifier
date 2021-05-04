const express = require("express")
    , nodemailer = require("nodemailer")
    , nodemon = require("nodemon");
require("./db/conn");

const app = express();
app.get("/", (request,response) => {
    response.send("welcome to home");
});

const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Server is running at port: "+ port);
});
