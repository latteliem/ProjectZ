const wbm = require('wbm');

wbm.start().then(async () => {
    const phones = ['6586009948', '6588607938'];
    const message = 'Hello there';
    await wbm.send(phones, message);
    await wbm.end();
}).catch(err => console.log(err));

