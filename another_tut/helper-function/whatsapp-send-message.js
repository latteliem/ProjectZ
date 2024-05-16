// Your Account SID and Auth Token from console.twilio.com
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken, {
  lazyLoading: false,
});

// funciton to send message to WhatsApp
const sendMessage = async(message, senderID) => {

    try {
        await client.messages.create({
            to: senderID,
            body: message,
            from: "whatsapp +14155238886"
        });
    } catch(error) {
        console.log("Error at send message --> ${error} ")
    }
};

module.exports = {
    sendMessage 
}