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

// Twilio WhatsApp Business API sends custom message upon running
// node dist/index
//--------------------------------------------------------
const accountSid = "AC25d72b09a5d2848d119c99ba66a8ba1f";
const authToken = "a583d68657ac085e53bdf31ba87fc174";
const client = require('twilio')(accountSid, authToken);

client.messages
      .create({
         from: 'whatsapp:+14155238886',
         body: 'Hello, there!',
         to: 'whatsapp:+6586009948'
       })
      .then(message => console.log(message.sid));