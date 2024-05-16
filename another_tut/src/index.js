// external packages
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

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
    res.send('Hello World.!');
});

const WA = require('../helper-function/whatsapp-send-message');

webApp.post('/whatsapp', (req, res) => {
    console.log(req.body);
    let message = req.body.Body;
    let senderID = req.body.From;
  
    console.log(message);
    console.log(senderID);
  
    // Write a function to send message back to WhatsApp
    WA.sendMessage('Hello from the other side.', senderID);
    res.status(200).send('Message processed');
  });
  

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});