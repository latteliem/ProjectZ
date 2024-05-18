const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

function sendMessage(body, to) {
    client.messages
        .create({
            body: body,
            from: 'whatsapp:+14155238886',
            to: to
        })
        .then(message => console.log(`Message sent: ${message.sid}`))
        .catch(error => console.error('Error sending message:', error));
}

module.exports = { sendMessage };
