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

app.get("/reply", (request, response) => {
    response.status(200).send("Hello World! from reply");
});

app.listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
    // Using Webhook as a listener for notifications to enable real time 
    console.log("webhook is listening");
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



// Open AI API for WhatsApp
//----------------------------------------------------------
//import OpenAI from "openai";
const {Client} = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const OpenAI = require("openai");
require("dotenv").config();

const client = new Client({
    webVersionCache: {
      type: "remote",
      remotePath:
        "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
  });

client.on('qr',(qr) =>{
    qrcode.generate(qr,{small:true});
});

client.on('ready',() =>{
    console.log("Client is ready");
});

client.initialize();

// whatsapp-bot.js

// const { spawn } = require('child_process');

// function generateResponse(message) {
//     return new Promise((resolve, reject) => {
//         const pythonProcess = spawn('python', ['C:\\Users\\user\\Documents\\\ProjectZ\\whatsapp_qrcode_method\\dist\\generate_response.py.py', message]);

//         let generatedText = '';

//         pythonProcess.stdout.on('data', (data) => {
//             generatedText += data.toString();
//         });

//         pythonProcess.on('close', (code) => {
//             if (code === 0) {
//                 resolve(generatedText);
//             } else {
//                 reject(new Error(`Python process exited with code ${code}`));
//             }
//         });

//         pythonProcess.on('error', (error) => {
//             reject(error);
//         });
//     });
// }
const { generateResponse } = require('./generate_response');
// Example usage:
var bot_message = generateResponse("Hello how to use machine learing model?");
callInitSendSMS(bot_message, "+6586009948");
// .then((response) => {
    //     console.log("Generated response:", response);
    //     // Use the generated response for further processing (e.g., sending to WhatsApp)
    // })
    // .catch((error) => {
    //     console.error("Error generating response:", error);
    // });


// const configuration = new OpenAI({
//     apiKey : process.env.SECRET_KEY,
// });
// const openai = new OpenAI(configuration);

// async function runCompletion(message){
//     const completion = await openai.createCompletion({
//         model:"text-davinci-003",
//         prompt: message,
//         max_tokens: 200,
//     });
//     return completion.data.choices[0].text;
// }

client.on('message',message => {
    console.log(message.body);
    runCompletion(message.body).then(result => message.reply(result));
})

//const app = express().use(body_parser.json());
app.use(body_parser.json()); // Add body parser middleware
// app.listen(8000, () => {
//     console.log("webhook is listening");
// });

// Importing the CallInitSendSMS function and call:
//----------------------------------------------------------
callInitSendSMS("Hello there!", "+6586009948");