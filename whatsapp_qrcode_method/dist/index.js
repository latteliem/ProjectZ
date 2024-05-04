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
    return new Promise((resolve, reject) => {
        console.log(req.body.Body);
        var messageToSend = "";
        if(req.body.Body == "inquire") {
            messageToSend = "Hello there, how i can assist you?";
            const button = document.getElementById('myButton');
            button.addEventListener('click', function() {
            // Code to execute when button is clicked
        });
        }
        else {
            messageToSend = "Hello" + req.body.Body + "How are you! Let me know how i can assist you.";
        }

        client.messages
                .create({
                    body:messageToSend,
                    from:"whatsapp:+14155238886",
                    to: "whatsapp:+6586009948"
                })
                .then((message) => {
                    console.log(message.sid);
                    resolve(message.sid);
                });
            });

        res.send('send via callback');
    });

app.post('/callback', (req, res) => {
    res.send("hello world!");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    const initialMessage = {
        body: "Hi! How can I assist you?",
        from: "whatsapp:+14155238886",
        to: "whatsapp:+6586009948",
        buttons: [
            { content_type: "text", title: "Inquire about products", payload: "inquire" },
            { content_type: "text", title: "Shop", payload: "shop" }
        ]
    };

    client.messages
        .create(initialMessage)
        .then((message) => {
            console.log(message.sid);
        })
        .catch((error) => {
            console.error("Error sending initial message:", error);
        });
  });

  