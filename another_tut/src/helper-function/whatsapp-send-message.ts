import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
console.log(accountSid);

const client = twilio(accountSid, authToken);

export function sendMessage(body, to) {
  client.messages
    .create({
      body: body,
      from: "whatsapp:+14155238886",
      to: to,
    })
    .then((message) => console.log(`Message sent: ${message.sid}`))
    .catch((error) => console.error("Error sending message:", error));
}

export default {
    sendMessage
}