// External packages
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import data structures
const { getAllProducts } = require('./products');
const carts = require('./cart');
const WA = require('../helper-function/whatsapp-send-message');

// Temporarily using a users list
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
    const message = req.body.Body.toLowerCase();
    const senderID = req.body.From;

    if (!users[senderID]) {
        users[senderID] = { state: 'initial' };
        WA.sendMessage('Welcome to LumiChat, and we allow businesses to go digital in less than 30 minutes. We are an open e-commerce market for Small and Medium Enterprises. '
        + '\nPlease create an account, or login. (Type "create account" or "login")', senderID);
    } else {
        handleUserState(senderID, message);
    }

    res.status(200).send('Message processed');
});

function handleUserState(senderID, message) {
    switch (users[senderID].state) {
        case 'initial':
            handleInitial(senderID, message);
            break;
        case 'createAccount':
            handleCreateAccount(senderID, message);
            break;
        case 'login':
            handleLogin(senderID, message);
            break;
        case 'loggedIn':
            handleLoggedInActions(senderID, message);
            break;
        case 'confirmPurchase':
            handleConfirmPurchase(senderID, message);
            break;
        default:
            WA.sendMessage('Invalid state. Please try again.', senderID);
    }
}

function handleInitial(senderID, message) {
    if (message === 'create account') {
        users[senderID].state = 'createAccount';
        WA.sendMessage('Please enter a username:', senderID);
    } else if (message === 'login') {
        users[senderID].state = 'login';
        WA.sendMessage('Please enter your username:', senderID);
    } else {
        WA.sendMessage('Invalid option. Please type "create account" or "login".', senderID);
    }
}

function handleCreateAccount(senderID, message) {
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
}

function handleLogin(senderID, message) {
    if (!users[senderID].loginUsername) {
        users[senderID].loginUsername = message;
        WA.sendMessage('Username received! Now enter your password:', senderID);
    } else if (!users[senderID].loginPassword) {
        users[senderID].loginPassword = message;
        verifyLogin(senderID);
    }
}

function verifyLogin(senderID) {
    const { loginUsername, loginPassword } = users[senderID];
    const user = Object.values(users).find(user => user.username === loginUsername);

    if (user) {
        bcrypt.compare(loginPassword, user.password, (err, result) => {
            if (result) {
                users[senderID].state = 'loggedIn';
                WA.sendMessage('Login successful! You can now view products by typing "view products".', senderID);
            } else {
                WA.sendMessage('Incorrect password. Please try again.', senderID);
                users[senderID].state = 'login';
            }
        });
    } else {
        WA.sendMessage('Username not found. Please try again.', senderID);
        users[senderID].state = 'login';
    }
}

function handleLoggedInActions(senderID, message) {
    if (message.toLowerCase() === 'view products' || message === '1') {
        const productMessage = getAllProducts();  // Calls the getAllProducts function
        WA.sendMessage(productMessage, senderID);
    } else if (message.startsWith('add') || !isNaN(parseInt(message))) {
        handleAddProduct(senderID, message);
    } else if (message === 'view cart' || message === '2') {
        handleViewCart(senderID);
    } else if (message === 'checkout' || message === '3') {
        handleCheckout(senderID);
    } else {
        WA.sendMessage('Welcome to our store! Here are some commands you can use:\n1. View Products\n2. View Cart\n3. Checkout\nYou can also add a product to your cart by typing "Add [Product ID]" or just the product ID.', senderID);
    }
}

function handleAddProduct(senderID, message) {
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
}

function handleViewCart(senderID) {
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
}

function handleCheckout(senderID) {
    const cart = carts[senderID];
    if (cart && cart.length > 0) {
        let total = 0;
        cart.forEach(item => {
            total += item.price;
        });
        WA.sendMessage(`Your total is $${total}. Do you confirm the purchase? (yes/no)`, senderID);
        users[senderID].state = 'confirmPurchase';
    } else {
        WA.sendMessage('Your cart is empty. Add items to your cart before checking out.', senderID);
    }
}

function handleConfirmPurchase(senderID, message) {
    if (message === 'yes') {
        WA.sendMessage('Thank you for your purchase! Your order is being processed.', senderID);
        delete carts[senderID];
        users[senderID].state = 'loggedIn';
    } else if (message === 'no') {
        WA.sendMessage('Purchase canceled. You can continue to add items to your cart or proceed to checkout again.', senderID);
        users[senderID].state = 'loggedIn';
    } else {
        WA.sendMessage('Please respond with "yes" or "no" to confirm your purchase.', senderID);
    }
}

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});
