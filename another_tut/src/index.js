// external packages
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import data structures
const products = require('./products');
const carts = require('./cart');
const WA = require('../helper-function/whatsapp-send-message');

// temporarily using a users list
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

// POST request from webapp
//===================================================
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

// Main function to handle our user's states
//============================================
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

// handle initial process of creating a LumiChat account
//============================================================
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

// function to handle logged in functions 
//=========================================================
function handleLoggedInActions(senderID, message) {
    if (message.toLowerCase === 'view products' || message === '1') {
        let productMessage = 'Available Products:\n';
        products.forEach(product => {
            productMessage += '*${product.id}*. ${product.name} - $${product.price}\n';
            productMessage += 'Description: ${product.description}\n\n';
        });
        productMessage += 'Please enter "Add " and its respective ID i.e. Add 1, to add it to cart.'
        WA.sendMessage(productMessage, senderID);
    }
    else {
        WA.sendMessage('No products available at the moment. Please check back later or consider buying a product instead.', senderID);
        WA.sendMessage('Would you like to browse our product catalog? Please type "view products" to see what’s available.', senderID);
    }

    // portion to handle an "add" into the cart
    if (message.startsWith('add') || !isNaN(parseInt(message))) {
        let productId;
        if (message.startsWith('add')) {
            productId = parseInt(message.split(' ')[1]);
        }
        else {
            productId = parseInt(message);
        }
        const product = products.find(p => p.id === productId) // to be replaced with Jovin's SQL querying
        if (product) {
            if (!carts[senderID]) {
                carts[senderID] = [];
            }
            //within this if statement, we could push the product into cart. to be replaced with
            // jovins associating product to cart
            carts[senderID].push(product);
            WA.sendMessage('${product.name} has been added to your cart. \
            \nType "view cart" to see your cart, or \
            \n "checkout" to proceed with your checkout.');
        }
        else {
            // error handling in a graceful way
            WA.sendMessage('Product not found. Please enter a valid product ID or name', senderID)
        }
    }
    else if (message === 'view cart' || message === '2') {
        const cart = carts[senderID];
        if (cart && cart.length > 0) {
            // we declare a cartMessage, that accumulates string of text
            let cartMessage = 'Your Cart: \n';
            let total = 0;
            cart.forEach(item => {
                cartMessage += '${item.name} - $${item.price} \n';
                // local variable, total, to store the total amount of money
                total += item.price;
            });
            cartMessage += 'Total: $${total}\n';
            cartMessage += 'Type "add" followed by the product ID to add more items, or \
            type "checkout" to proceed';
            WA.sendMessage(cartMessage, senderID);
        }
        else {
            WA.sendMessage('Your cart is empty.', senderID);
        }
    }

    // view cart functionality
    else if (message === 'view cart' || message === 2) {
        const cart = carts[senderID];
        if (cart && cart.length > 0) {
            let cartMessage = "Your Cart: \n";
            let total = 0;
            cart.forEach(item => {
                cartMessage += '${item.name} - $${item.price}\n';
                total += item.price;
            });
            cartMessage += 'Total: $${total}\n';
            cartMessage += 'Type "add" followed by the product ID to add more items, or\
            "checkout" to proceed.'
            WA.sendMessage(cartMessage, senderID);
        }
        else {
            WA.sendMessage('Your cart is empty', senderID);
        }
    }
    
    else if (message === "checkout" || message === '3') {
        const cart = carts[senderID];
        if (cart && cart.length > 0){
            let total = 0;
            cart.forEach(item => {
                total += item.price;
            });

            // to be replaced with buttons of whatsapp templates
            WA.sendMessage('Your total is $$ {total}. Do you want to confirm the purchase? (yes/no)')
            // we then set the state of the user to "confirm purchase"
            users[senderID].state = 'confirmPurchase';
        }
        else {
            WA.sendMessage('Your cart is empty. Add items to your cart before checking out');
        }
    }
    else if (users[senderID].state === 'confirmPurchase') {
        if (message === 'yes') {
            WA.sendMessage('Thank you for your purchase! Your order is now being processed.')
        }
    }
    
}



// function to handle the creation of account process
//============================================================
function handleCreateAccount(senderID, message) {
    if (!users[senderID].username) {
        users[senderID].username = message;
        WA.sendMessage('Username set! Now enter a password:', senderID);
    } 

    else if (!users[senderID].password) {
        bcrypt.hash(message, 10, (err, hash) => {
            if (err) {
                WA.sendMessage('An error occurred. Please try again.', senderID);
            } 
            else {
                users[senderID].password = hash;
                users[senderID].state = 'loggedIn';
                WA.sendMessage('Account created successfully! You can now view products by typing "view products".', senderID);
            }
        });
    }
}

// function to handle the login of account
//============================================================
function handleLogin(senderID, message) {
    if (!users[senderID].loginUsername) {
        users[senderID].loginUsername = message;
        WA.sendMessage('Username received! Now enter your password:', senderID);
    } 
    else if (!users[senderID].loginPassword) {
        users[senderID].loginPassword = message;
        verifyLogin(senderID);
    }
}

// function to verify log in - needed by handleLogin
//===================================================
function verifyLogin(senderID) {
    const { loginUsername, loginPassword } = users[senderID];
    const user = Object.values(users).find(user => user.username === loginUsername);

    if (user) {
        // bcrypt would compare the password encrypted, to the user's password that is queried
        bcrypt.compare(loginPassword, user.password, (err, result) => {
            if (result) {
                users[senderID].state = 'loggedIn';
                WA.sendMessage('Login successful! You can now view products by typing "view products".', senderID);
            } 
            else {
                WA.sendMessage('Incorrect password. Please try again.', senderID);
                users[senderID].state = 'login';
            }
        });
    } 
    else {
        WA.sendMessage('Username not found. Please try again.', senderID);
        users[senderID].state = 'login';
    }
}

// handling the displaying of products
//=========================================



// handling the viewing of products
//===========================================
function handleViewProducts(senderID) {
    let productMessage = 'Available Products:\n';
    products.forEach(product => {
        productMessage += `*${product.id}*. ${product.name} - $${product.price}\n`;
        productMessage += `Description: ${product.description}\n\n`;
    });
    productMessage += 'Please enter "Add" + the ID of product i.e. Add 1, to add it to your cart.';
    WA.sendMessage(productMessage, senderID);
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
//================================================
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});

