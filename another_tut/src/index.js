// external packages
const express = require('express');
const bodyParser = require('body-parser');
//const whatsappSendMessage = require('../helper-function/whatsapp-send-message.js');
//re('dotenv').config();

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(bodyParser.urlencoded({
    extended: true
}));
webApp.use(bodyParser.json());

// Server Port
const PORT = process.env.PORT;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

//const WA = require('../helper-function/whatsapp-send-message');
const WA = require('../helper-function/whatsapp-send-message');
// Route for WhatsApp
webApp.post('/whatsapp', async (req, res) => {
    console.log(req.body);
    let message = req.body.Body;
    let senderID = req.body.From;

    console.log(message);
    console.log(senderID);

    // writing a funciton to send message back to WhatsApp
    await WA.sendMessage('Hello from the other side', senderID)
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});