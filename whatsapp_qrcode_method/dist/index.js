const express = require('express');
const http = require('http');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const accountSid = 'AC25d72b09a5d2848d119c99ba66a8ba1f';  // Your Twilio Account SID
const authToken = '4f793fc1dcf86fc4f2d24b77cfcf3f83';  // Your Twilio Auth Token
const twilioPhoneNumber = 'whatsapp:+14155238886';  // Your Twilio WhatsApp number
const userPhoneNumber = 'whatsapp:+6586009948';  // Your WhatsApp number

const client = require('twilio')(accountSid, authToken);

const port = 3000;
const localhost = "127.0.0.1";

// Serve static files from the "public" directory
app.use(express.static('public'));

const conversationState = {};

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.post('/send-message', (req, res) => {
    const requestBody = JSON.stringify(req.body);
    console.log("Received a request to /send-message:", req.body);

    const options = {
        hostname: localhost,
        port: port,
        path: '/webhook',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    };

    const request = http.request(options, response => {
        let data = '';

        response.on('data', chunk => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                res.status(response.statusCode).json({ message: 'Message sent successfully', data: jsonData });
            } catch (error) {
                res.status(500).json({ message: 'Error parsing response', error: error.message });
            }
        });
    });

    request.on('error', error => {
        console.error("Error in /send-message request:", error);
        res.status(500).json({ message: 'Error sending message', error: error.message });
    });

    request.write(requestBody);
    request.end();
});

// Change '/reply' to '/webhook'
app.post('/webhook', (req, res) => {
    console.log('Received a POST request to /webhook:', req.body);
    const userMessage = req.body.Body ? req.body.Body.toLowerCase() : "";
    const from = req.body.From;
    let messageToSend = '';

    if (!conversationState[from]) {
        conversationState[from] = { state: 'initial' };
    }

    const currentState = conversationState[from].state;

    switch (currentState) {
        case 'initial':
            if (userMessage === '1' || userMessage === 'inquire') {
                messageToSend = 'View our products:\n**1.** Cat food \n**2.** Dog food\n**3.** Hamster food';
                conversationState[from].state = 'productList';
            } else {
                messageToSend = "I'm sorry, I didn't understand that. Please select one of the options.";
            }
            sendMessage(from, messageToSend);
            break;

        case 'productList':
            const products = ['cat food', 'dog food', 'hamster food'];
            const selectedProductIndex = Number(userMessage) - 1;
            if (selectedProductIndex >= 0 && selectedProductIndex < products.length) {
                messageToSend = `Proceed to purchase ${products[selectedProductIndex]}? (Yes/no)`;
                conversationState[from].state = 'purchaseConfirmation';
                conversationState[from].selectedProduct = products[selectedProductIndex];
            } else {
                messageToSend = 'Invalid selection. Please select a product from the list.';
            }
            sendMessage(from, messageToSend);
            break;

        case 'purchaseConfirmation':
            if (userMessage === 'yes') {
                messageToSend = 'Payment received!';
            } else if (userMessage === 'no') {
                messageToSend = 'Feel free to browse our other products!';
            } else {
                messageToSend = "Please respond with 'yes' or 'no'.";
            }
            sendMessage(from, messageToSend);
            delete conversationState[from];
            break;

        default:
            messageToSend = "Oops! Something went wrong. Let's start over.";
            sendMessage(from, messageToSend);
            delete conversationState[from];
            break;
    }

    res.json({ message: 'Message processed' });
});

function sendMessage(to, message) {
    client.messages
        .create({
            body: message,
            from: twilioPhoneNumber,
            to: to,
        })
        .then((message) => {
            console.log('Message sent:', message.sid);
        })
        .catch((error) => {
            console.error('Error sending message:', error);
        });
}

// Function to send initial "press 1" message
function sendInitialMessage() {
    const initialMessage = "Hi! We are LumiChat. Press 1 to inquire about our products.";
    sendMessage(userPhoneNumber, initialMessage);
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    sendInitialMessage();
});
