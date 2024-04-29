// Twilio WhatsApp Business API sends custom message upon running
// node dist/index
//--------------------------------------------------------
async function callInitSendSMS(messageDraft, mobileNumber) {

    const accountSid = "AC25d72b09a5d2848d119c99ba66a8ba1f";
    const authToken = "a583d68657ac085e53bdf31ba87fc174";
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            from: 'whatsapp:+14155238886',
            body: 'Hello, there!',
            to: 'whatsapp:+6586009948'
        })
        .then(message => console.log(message.sid));
}

module.exports = {
    callInitSendSMS
};