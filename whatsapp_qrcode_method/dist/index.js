const express = require('express');
//const dialogflow = require('@google-cloud/dialogflow').v2beta1
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = 3000;

const accountSid = "AC25d72b09a5d2848d119c99ba66a8ba1f";
const authToken = "a583d68657ac085e53bdf31ba87fc174";
	
const client = require('twilio')(accountSid, authToken);


app.get('/', (req, res) => {
    res.send("Hello world!");
});

app.get('/reply', (req, res) => {
    res.send("Hello world! from reply");
});

app.post('/reply', express.json(), (req,res) => {
    console.log(req.body.Body);
    var messageToSend = "";
    if(req.body.Body === "1" || req.body.Body === "inquire"){
        messageToSend = "View our products:\n"+
        "1. Cat food \n2. Dog food\n 3. Hamster food";
        
    //     const button = document.getElementById('myButton');
    //     button.addEventListener('click', function() {
    //     // Code to execute when button is clicked
    // });
    }
    else {
        messageToSend = "Hello" + req.body.Body + "How are you! Let me know how i can assist you.";
    }

    // client.messages
    //         .create({
    //             body:messageToSend,
    //             from:"whatsapp:+14155238886",
    //             to: "whatsapp:+6586009948"
    //         })
    //         .then((message) => {
    //             console.log(message.sid);
    //             resolve(message.sid);
    //         });
    sendMessage(messageToSend);
        });

    //res.send('send via callback');

// app.post('/callback', (req, res) => {
//     res.send("hello world!");
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    const initialMessage = {
        body: "Hi! We are LumiChat, and we allow businesses to go digital in less than 30 minutes. We are an open e-commerce market for Small and Medium Enterprises. "+
        "Press: \n1. to inquire about our products \n2. shop from our catalog.\nHave fun!",
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