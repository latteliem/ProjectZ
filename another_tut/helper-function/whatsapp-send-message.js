const accountSid = 'AC25d72b09a5d2848d119c99ba66a8ba1f';
const authToken = '4f793fc1dcf86fc4f2d24b77cfcf3f83';
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
