const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client( {authStrategy: new LocalAuth()} );

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true })
});

client.on('ready', () => {
  console.log("Client is ready!");
});

// client.on('message', (message) => {
//   if (message.body.includes('cat')) {
//     return message.reply('I love cats!')
//   }
// });
client.initialize();