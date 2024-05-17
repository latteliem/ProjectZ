// external packages
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import data structures
const products = require('./products');
const carts = require('./cart');
const WA = require('../helper-function/whatsapp-send-message');

// Data structure to store user credentials (for demonstration purposes only; consider using a database in production)
const users = {};

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(bodyParser.urlencoded({ extended: true }));
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

    if (!users[senderID]) {
        users[senderID] = { state: 'createAccount' };
        WA.sendMessage('Welcome! Please create an account. Enter a username:', senderID);
    } else if (users[senderID].state === 'createAccount') {
        if (!users[senderID].username) {
            users[senderID].username = message;
            WA.sendMessage('Username set! Now enter a password:', senderID);
        } else if (!users[senderID].password) {
            bcrypt.hash(message, 10, (err, hash) => {
                if (err) {
                    WA.sendMessage('An error occurred. Please try again.', senderID);
                } else {
                    users[senderID].password = hash;
                    users[senderID].state = 'loggedIn';
                    WA.sendMessage('Account created successfully! You can now view products by typing "view products".', senderID);
                }
            });
        }
    } else if (message === 'view products' || message === '1') {
        let productMessage = 'Available Products:\n';
        products.forEach(product => {
            productMessage += `*${product.id}*. ${product.name} - $${product.price}\n`;
            productMessage += `Description: ${product.description}\n\n`;
        });
        productMessage += 'Please enter "Add" + the ID of product i.e. Add 1, to add it to your cart.';
        WA.sendMessage(productMessage, senderID);
    } else if (message.startsWith('add') || !isNaN(parseInt(message))) {
        let productId;
        if (message.startsWith('add')) {
            productId = parseInt(message.split(' ')[1]);
        } else {
            productId = parseInt(message);
        }
        const product = products.find(p => p.id === productId);
        if (product) {
            if (!carts[senderID]) {
                carts[senderID] = [];
            }
            carts[senderID].push(product);
            WA.sendMessage(`${product.name} has been added to your cart. Type 'view cart' to see your cart or 'checkout' to proceed to checkout.`, senderID);
        } else {
            WA.sendMessage('Product not found. Please enter a valid product ID or name.', senderID);
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
            cartMessage += `Total: $${total}\n`;
            cartMessage += 'Type "add" followed by the product ID to add more items or "checkout" to proceed.';
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
            WA.sendMessage(`Your total is $${total}. Do you confirm the purchase? (yes/no)`, senderID);
            carts[senderID].state = 'confirmPurchase';
        } else {
            WA.sendMessage('Your cart is empty. Add items to your cart before checking out.', senderID);
        }
    } else if (carts[senderID] && carts[senderID].state === 'confirmPurchase') {
        if (message === 'yes') {
            WA.sendMessage('Thank you for your purchase! Your order is being processed.', senderID);
            delete carts[senderID];
        } else if (message === 'no') {
            WA.sendMessage('Purchase canceled. You can continue to add items to your cart or proceed to checkout again.', senderID);
            delete carts[senderID].state;
        } else {
            WA.sendMessage('Please respond with "yes" or "no" to confirm your purchase.', senderID);
        }
    } else {
        WA.sendMessage('Welcome to our store! Here are some commands you can use:\n1. View Products\n2. View Cart\n3. Checkout\nYou can also add a product to your cart by typing "Add [Product ID]" or just the product ID.', senderID);
    }

    res.status(200).send('Message processed');
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});
