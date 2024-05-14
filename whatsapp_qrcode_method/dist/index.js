const express = require('express');
//const dialogflow = require('@google-cloud/dialogflow').v2beta1
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = 3000;

const accountSid = "AC25d72b09a5d2848d119c99ba66a8ba1f";
const authToken = "eda3cf451675000b149befec2e6d922f";
	
const client = require('twilio')(accountSid, authToken);


app.get('/', (req, res) => {
    res.send("Hello world!");
});

app.get('/reply', (req, res) => {
    res.send("Hello world! from reply");
});

// Define a variable to store the conversation state
//let conversationState = {};

app.post('/reply', express.json(), (req, res) => {
    console.log(req.body.Body);
    const userMessage = req.body.Body.toLowerCase();
    let messageToSend = "";
    console.log("JHi");
    if (!conversationState[req.body.From]) {
        // Initialize conversation state for the user
        conversationState[req.body.From] = {
            state: "initial"
        };
    }

    const currentState = conversationState[req.body.From].state;
    console.log(curentState);
    console.log(userMessage)
    switch (currentState) {
        case "initial":
            if (userMessage === "1" || userMessage === "inquire") {
                // Send product list
                messageToSend = "View our products:\n"+
                                "1. Cat food \n2. Dog food\n3. Hamster food";
                conversationState[req.body.From].state = "productList";
            } else {
                messageToSend = "I'm sorry, I didn't understand that. Please select one of the options.";
            }
            sendMessage(messageToSend);
            break;
            
        case "productList":
            products = ["cat food", "dog food", "hamster food"];
            const selectedProductIndex = Number(userMessage) - 1;
            if (selectedProductIndex >= 0 && selectedProductIndex < products.length) {
                // Prompt for purchase
                messageToSend = `Proceed to purchase ${products[selectedProductIndex]}? (Yes/no)`;
                conversationState[req.body.From].state = "purchaseConfirmation";
                conversationState[req.body.From].selectedProduct = products[selectedProductIndex];
            } else {
                messageToSend = "Invalid selection. Please select a product from the list.";
            }
            sendMessage(messageToSend);
            break;

        case "purchaseConfirmation":
            if (userMessage === "yes") {
                // Payment received
                messageToSend = "Payment received!";
            } else if (userMessage === "no") {
                // User declined purchase
                messageToSend = "Feel free to browse our other products!";
            } else {
                // Invalid response
                messageToSend = "Please respond with 'yes' or 'no'.";
            }
            sendMessage(messageToSend);
            // Reset conversation state and clear user input
            delete conversationState[req.body.From];
            req.body.Body = "";
            break;

        default:
            // Invalid state, reset conversation
            messageToSend = "Oops! Something went wrong. Let's start over.";
            sendMessage(messageToSend);
            delete conversationState[req.body.From];
            break;
    }

    res.send('send via callback');
});


    //res.send('send via callback');

// app.post('/callback', (req, res) => {
//     res.send("hello world!");
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    const initialMessage = {
        body: "Hi! We are LumiChat, and we allow businesses to go digital in less than 30 minutes. We are an open e-commerce market for Small and Medium Enterprises. "+
        "Press: \n*1* to inquire about our products \n*2*. shop from our catalog.\nHave fun!",
        from: "whatsapp:+14155238886",
        to: "whatsapp:+6586009948",
        // buttons: [
        //     { content_type: "text", title: "Inquire about products", payload: "inquire" },
        //     { content_type: "text", title: "Shop", payload: "shop" }
        // ]
    };
    sendMessage("Hi! We are LumiChat, and we allow businesses to go digital in less than 30 minutes. We are an open e-commerce market for Small and Medium Enterprises. "+
    "Press: \n1. to inquire about our products \n2. shop from our catalog.\nHave fun!");
    // client.messages
    //     .create(initialMessage)
    //     .then((message) => {
    //         console.log(message.sid);
    //     })
    //     .catch((error) => {
    //         console.error("Error sending initial message:", error);
    //     });
  });


const conversationState = {};
function sendMessage(messageToSend){
    client.messages
                .create({
                    body:messageToSend,
                    from:"whatsapp:+14155238886",
                    to: "whatsapp:+6586009948"
                })
                .then((message) => {
                    console.log(message.sid);
                    //resolve(message.sid);
                });
}