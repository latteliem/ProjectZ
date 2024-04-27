"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// configures dotenv to work in your application
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
app.get("/", (request, response) => {
    response.status(200).send("Hello World");
});
app.listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
});


// Using Webhook as a listener for notifications to enable real time 
// communication between different applications or services
//----------------------------------------------------------
//const express = require("express");
const body_parser = require("body-parser");
const { callInitSendSMS } = require("./WhatsApp");
const { MobileInstance } = require("twilio/lib/rest/api/v2010/account/availablePhoneNumberCountry/mobile");

//const app = express().use(body_parser.json());
app.use(body_parser.json()); // Add body parser middleware
app.listen(8000, () => {
    console.log("webhook is listening");
});

// Importing the CallInitSendSMS function and call:
//----------------------------------------------------------
callInitSendSMS("Hello there!", "+6586009948");