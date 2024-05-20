// External packages
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();
const twilio = require('twilio');

// Import data structures
const { products, getAllProducts } = require('./products');
const carts = require('./cart');
const WA = require('../helper-function/whatsapp-send-message');

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Twilio phone numbers
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const userPhoneNumber = process.env.USER_PHONE_NUMBER;

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

webApp.post('/whatsapp', async (req, res) => {
    const message = req.body.Body.toLowerCase().trim();
    const senderID = req.body.From;
    console.log(`Received message: ${message} from ${senderID}`);

    if (!users[senderID]) {
        // Send onboarding message
        users[senderID] = { state: 'initial' };
        await WA.sendMessage(
            'Welcome to LumiChat! We allow businesses to go digital in less than 30 minutes. We are an open e-commerce market for Small and Medium Enterprises. '
            + '\nPlease create an account, log in, or view products. (Type "create account", "login", or "view products")', 
            senderID
        );
    }

    handleUserState(senderID, message);

    res.status(200).send('Message processed');
});

function handleUserState(senderID, message) {
    console.log(`Handling state for user: ${senderID}, current state: ${users[senderID].state}`);
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
        case 'viewProducts':
            handleViewProducts(senderID);
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
    } else if (message === 'view products') {
        users[senderID].state = 'viewProducts';
        handleViewProducts(senderID);
    } else {
        WA.sendMessage('Invalid option. Please type "create account", "login", or "view products".', senderID);
    }
}

function handleCreateAccount(senderID, message) {
    if (!users[senderID].username) {
        users[senderID].username = message;
        WA.sendMessage('Username set! Now enter a password:', senderID);
    } else if (!users[senderID].password) {
        const rawPassword = message; // Store the raw password for logging
        bcrypt.hash(message, 10, (err, hash) => {
            if (err) {
                WA.sendMessage('An error occurred. Please try again.', senderID);
            } else {
                users[senderID].password = hash;
                users[senderID].rawPassword = rawPassword; // Save the raw password
                users[senderID].state = 'loggedIn';
                WA.sendMessage('Account created successfully!', senderID);
                handleLoggedInActions(senderID, ''); // Trigger logged in actions after account creation
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
        console.log(`User entered password: ${message}`); // Log the password securely for debugging
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
                WA.sendMessage('Login successful!', senderID);
                handleLoggedInActions(senderID, ''); // Trigger logged in actions after login
            } else {
                console.log(`User entered incorrect password: ${loginPassword}`); // Log incorrect password for debugging
                WA.sendMessage('Incorrect password. Please try again. Enter your password:', senderID);
                users[senderID].loginPassword = null; // Clear the password
                handleLogin(senderID, ''); // Prompt for the password again
            }
        });
    } else {
        console.log(`Username not found: ${loginUsername}`); // Log username not found for debugging
        WA.sendMessage('Username not found. Please enter your username again:', senderID);
        users[senderID].loginUsername = null; // Clear the username
        handleLogin(senderID, ''); // Prompt for the username again
    }
}

function handleViewProducts(senderID) {
    const productMessage = getAllProducts();
    WA.sendMessage(productMessage, senderID);
    users[senderID].state = 'loggedIn'; // Reset state to loggedIn after viewing products
}

function handleLoggedInActions(senderID, message) {
    console.log(`Handling loggedIn actions for user: ${senderID}`);
    console.log(message);

    if (message.startsWith('add') || !isNaN(parseInt(message))) {
        handleAddProduct(senderID, message);
    } 
    else if (message === 'view products' || message === '1') {
        handleViewProducts(senderID);
        console.log('here');
    }
    else if (message === 'view cart' || message === '2') {
        handleViewCart(senderID);
    } else if (message === 'checkout' || message === '3') {
        handleCheckout(senderID);
    } else {
        WA.sendMessage(
            'Welcome to our store! Here are some commands you can use:\n1. View Products\n2. View Cart\n3. Checkout\n',
            senderID
        );
    }
}


function handleAddProduct(senderID, message) {
    if (!users[senderID] || !users[senderID].username) {
        users[senderID] = { state: 'initial' };  // Set state to initial if the user object does not exist
        WA.sendMessage('Please create an account or log in before adding items to your cart.', senderID);
        WA.sendMessage('Please create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
        return;
    }
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
    if (!users[senderID].username) {
        users[senderID].state = 'initial';
        WA.sendMessage('Please create an account or log in to view your cart.', senderID);
        WA.sendMessage('Please create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
        return;
    }
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
    if (!users[senderID].username) {
        users[senderID].state = 'initial';
        WA.sendMessage('Please create an account or log in to proceed with checkout.', senderID);
        WA.sendMessage('Please create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
        return;
    }
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
        users[senderID].state = 'loggedIn'; // Reset state to loggedIn when the cart is empty
    }
}


function handleConfirmPurchase(senderID, message) {
    if (message === 'yes') {
        WA.sendMessage('Thank you for your purchase! Your order is being processed.', senderID);
        delete carts[senderID];
        users[senderID].state = 'loggedIn';
        handleLoggedInActions(senderID, ''); // Trigger logged in actions after purchase confirmation
    } else if (message === 'no') {
        WA.sendMessage('Purchase canceled. You can continue to add items to your cart or proceed to checkout again.', senderID);
        users[senderID].state = 'loggedIn';
        handleLoggedInActions(senderID, ''); // Trigger logged in actions after purchase cancellation
    } else {
        WA.sendMessage('Please respond with "yes" or "no" to confirm your purchase.', senderID);
    }
}

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
    
    // Simulate incoming message to send initial welcome message
    const senderID = `whatsapp:+6586009948`;
    if (!users[senderID]) {
        users[senderID] = { state: 'initial' };
        WA.sendMessage('Welcome to LumiChat! We allow businesses to go digital in less than 30 minutes. We are an open e-commerce market for Small and Medium Enterprises. '
        + '\nPlease create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
    }
});
