// external packages
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import data structures
const products = require('./products');
const carts = require('./cart');
const WA = require('../helper-function/whatsapp-send-message');

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(bodyParser.urlencoded({
    extended: true
}));
webApp.use(bodyParser.json());

// Server Port
const PORT = process.env.PORT || 3000;

// Home route
webApp.get('/', (req, res) => {
    res.send('Hello World.!');
});

webApp.post('/whatsapp', (req, res) => {
    console.log(req.body);
    const message = req.body.Body.toLowerCase();
    const senderID = req.body.From;
  
    console.log(message);
    console.log(senderID);
  
    // Check for commands and handle accordingly
    if (message === 'view products' || message === '1') {
        let productMessage = 'Available Products:\n';
        products.forEach(product => {
            productMessage += `*${product.id}*. ${product.name} - $${product.price}\n`;
        });
        WA.sendMessage(productMessage, senderID);
    } else if (message.startsWith('add')) {
        const productId = parseInt(message.split(' ')[1]);
        const product = products.find(p => p.id === productId);
        if (product) {
            if (!carts[senderID]) {
                carts[senderID] = [];
            }
            carts[senderID].push(product);
            WA.sendMessage(`${product.name} has been added to your cart.`, senderID);
        } else {
            WA.sendMessage('Product not found. Please enter a valid product ID.', senderID);
        }
    } else if (message === 'view cart' || message === '2') {
        const cart = carts[senderID];
        if (cart && cart.length > 0) {
            let cartMessage = 'Your Cart:\n';
            let total = 0;
            cart.forEach(item => {
                cartMessage += `${item.name} - $${item.price}\n`;
                total += item.price;
            });
            cartMessage += `Total: $${total}`;
            WA.sendMessage(cartMessage, senderID);
        } else {
            WA.sendMessage('Your cart is empty.', senderID);
        }
    } else if (message === 'checkout' || message === '3') {
        const cart = carts[senderID];
        if (cart && cart.length > 0) {
            let total = 0;
            cart.forEach(item => {
                total += item.price;
            });
            WA.sendMessage(`Thank you for your purchase! Your total is $${total}.`, senderID);
            delete carts[senderID];
        } else {
            WA.sendMessage('Your cart is empty. Add items to your cart before checking out.', senderID);
        }
    } else {
        WA.sendMessage('Welcome to our store! Here are some commands you can use:\n1. View Products\n2. View Cart\n3. Checkout\nYou can also add a product to your cart by typing "Add [Product ID]".', senderID);
    }

    res.status(200).send('Message processed');
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});
