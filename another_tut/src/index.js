// External packages
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const twilio = require('twilio');

// Setting up MongoDB database
const Business = require('./businessClass');
const Product = require('./productClass'); 
const User = require('./userClass');
const { MongoClient } = require('mongodb');

// Setting up Stripe API
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});
 
// Import data structures
const { products, getAllProducts } = require('./products');
const carts = require('./cart');
const WA = require('../helper-function/whatsapp-send-message');

// Log to verify if the variables are loaded
// console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
// console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN);

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);
if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
}
 
// Twilio phone numbers
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const userPhoneNumber = process.env.USER_PHONE_NUMBER;
//const db = connectToDatabase(); // TO INITIALISE CONNECTION TO DATABASE SOON
//database set up
let userCollection;
let productCollection;

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

function connectToDatabase() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    const dbName = 'LumiChat_database';

    return client.connect().then(() => {
        const db = client.db(dbName);
        console.log('Connected to database');
        return db;
    }).catch(err => {
        console.error(err);
        throw err;
    });
}


function handleCreateAccount(senderID, message) {
    // setting up database
    connectToDatabase().then(db => {
        // using or creating a userCollection for the specific database
        const userCollection = db.collection('userCollection');
        
        userCollection.findOne({}, { sort: { userid: -1 } }).then(highestIdDoc => {
            const highestId = highestIdDoc ? highestIdDoc.userid : 0;

            // Assign the next value to userID
            const uniIdentifier = highestId + 1;

            if (!users[senderID].username) {
                users[senderID].username = message;

                // checking if the username exists
                userCollection.findOne({ username: users[senderID].username }).then(existingUser => {
                    console.log('existingUser', existingUser);
                    if (existingUser) {
                        // Username already exists
                        console.log('Username already exists:', users[senderID].username);
                        users[senderID].username = null; // Clear the username
                        WA.sendMessage('Username already exists. Please choose another username:', senderID);
                        return;
                    }
                    WA.sendMessage('Username set! Now enter a password:', senderID);
                }).catch(err => {
                    console.error(err);
                    WA.sendMessage('An error occurred. Please try again.', senderID);
                });
            } else if (!users[senderID].password) {
                const rawPassword = message; // Store the raw password for logging
                bcrypt.hash(message, 10).then(hash => {
                    users[senderID].password = hash;
                    users[senderID].rawPassword = rawPassword; // Save the raw password
                    
                    const newUser = new User(uniIdentifier, users[senderID].username, users[senderID].password);
                    userCollection.insertOne(newUser).then(() => {
                        console.log('New user inserted successfully!');
                        console.log(newUser);
                        
                        users[senderID].state = 'loggedIn';
                        WA.sendMessage('Account created successfully!', senderID);
                        handleLoggedInActions(senderID, ''); // Trigger logged in actions after account creation
                    }).catch(err => {
                        console.error(err);
                        WA.sendMessage('An error occurred. Please try again.', senderID);
                    });
                }).catch(err => {
                    console.error(err);
                    WA.sendMessage('An error occurred. Please try again.', senderID);
                });
            }
        }).catch(err => {
            console.error(err);
            WA.sendMessage('An error occurred. Please try again.', senderID);
        });
    }).catch(err => {
        console.error(err);
        WA.sendMessage('An error occurred. Please try again.', senderID);
    });
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
 
async function verifyLogin(senderID) {
    const db = await connectToDatabase();
    // using or creating a userCollection for the specific database
    const userCollection = db.collection('userCollection');

    // finding username in database
    const { loginUsername, loginPassword } = users[senderID];
    const user = await userCollection.findOne({ username: loginUsername });
    if (user) {
        console.log('User found:', user); // Log the found user object for debugging
        console.log('Login password:', user.userpassword);
        console.log('Login username:', loginUsername);
        console.log('Login password:', loginPassword);
        
        if (loginPassword && user.userpassword) {
            //const hash = await bcrypt.hash(loginPassword, 10)
            const upassword = user.userpassword;
            //need to hash the incoming password then compare
            const match = await bcrypt.compare(loginPassword, upassword);
            if (match) {
                users[senderID].state = 'loggedIn';
                WA.sendMessage('Login successful!', senderID);
                handleLoggedInActions(senderID, ''); // Trigger logged in actions after login
            } else {
                console.log(`User entered incorrect password: ${loginPassword}`); // Log incorrect password for debugging
                WA.sendMessage('Incorrect password. Please try again. Enter your password:', senderID);
                users[senderID].loginPassword = null; // Clear the password
                handleLogin(senderID, ''); // Prompt for the password again
            }
        } else {
            console.error('Password is missing for comparison.');
            WA.sendMessage('An error occurred. Please try again later.', senderID);
        }
    } else {
        console.log(`Username not found: ${loginUsername}`); // Log username not found for debugging
        WA.sendMessage('Username not found. Please enter your username again:', senderID);
        users[senderID].loginUsername = null; // Clear the username
        handleLogin(senderID, ''); // Prompt for the username again
    }
}

 
async function handleViewProducts(senderID) {
    const db = await connectToDatabase(); //connecting to database

    const productMessage = await Product.getAllProducts(db);

    WA.sendMessage(productMessage, senderID);
    users[senderID].state = 'loggedIn'; // Reset state to loggedIn after viewing products
}
 
function handleLoggedInActions(senderID, message) {
    console.log(`Handling loggedIn actions for user: ${senderID}`);
    console.log(message);

    if (message === 'view products' || message === '1') {
        handleViewProducts(senderID);
    } else if (message === 'view cart' || message === '2') {
        handleViewCart(senderID);
    } else if (message === 'checkout' || message === '3') {
        handleCheckout(senderID);
    } else if (message.startsWith('add') || !isNaN(parseInt(message))) {
        handleAddProduct(senderID, message);
    } else {
        WA.sendMessage(
            'Welcome to our store! Here are some commands you can use:\n1. View Products\n2. View Cart\n3. Checkout\n',
            senderID
        );
    }
}

 
function handleAddProduct(senderID, message) {
    connectToDatabase().then(db => {
        if (!users[senderID] || !users[senderID].username) {
            users[senderID] = { state: 'initial' };
            WA.sendMessage('Please create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
            return;
        }

        const userCollection = db.collection('userCollection');
        userCollection.findOne({ username: users[senderID].username }).then(userRecord => {
            if (!userRecord) {
                console.log(`Username not found: ${users[senderID].username}`);
                WA.sendMessage('Username not found. Please enter your username again:', senderID);
                users[senderID].loginUsername = null;
                return handleLogin(senderID, '');
            }

            let productId;
            let quantityToPurchase;
            if (message.startsWith('add')) {
                productId = parseInt(message.split(' ')[1]);
                quantityToPurchase = parseInt(message.split(',')[1]);
            } else {
                productId = parseInt(message);
                quantityToPurchase = parseInt(message);
            }

            const productCollection = db.collection('productCollection');
            productCollection.findOne({ prodid: productId }).then(product => {
                if (product) {
                    if (quantityToPurchase <= product.prodquan) {
                        addToCart(userRecord, product, quantityToPurchase);
                    } else {
                        WA.sendMessage(`Insufficient stock for purchase, we only have ${product.prodquan} left!`, senderID);
                    }

                    userCollection.updateOne(
                        { userid: userRecord.userid },
                        { $set: { shoppingCart: userRecord.shoppingCart } }
                    ).then(() => {
                        WA.sendMessage(`${product.prodname} has been added to your cart. Type 'view cart' to see your cart or 'checkout' to proceed to checkout.`, senderID);
                    }).catch(err => {
                        console.error(err);
                        WA.sendMessage('An error occurred while updating the cart. Please try again.', senderID);
                    });
                } else {
                    WA.sendMessage('Product not found. Please enter a valid product ID or name.', senderID);
                }
            }).catch(err => {
                console.error(err);
                WA.sendMessage('An error occurred. Please try again.', senderID);
            });
        }).catch(err => {
            console.error(err);
            WA.sendMessage('An error occurred. Please try again.', senderID);
        });
    }).catch(err => {
        console.error(err);
        WA.sendMessage('An error occurred. Please try again.', senderID);
    });
}

 
async function addToCart(user, product, quantityToPurchase){//prodID, prodName, prodSellPrice, prodQuantity){
    const productInCart = { //creating a function to add the product and the quantity of product that the user would like to purchase
        prodid: product.prodid,
        prodname: product.prodname,
        prodsprice: product.prodsprice,
        quantityToPurchase
    };
    user.shoppingCart.push(productInCart);    //adds the product that the user wants to buy to the empty shopping cart array    
}

async function handleViewCart(senderID) {
    const db = connectToDatabase();

    if (!users[senderID].username) {
        users[senderID].state = 'initial';
        //WA.sendMessage('Please create an account or log in to view your cart.', senderID);
        WA.sendMessage('Please create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
        return;
    }

    const userCollection = db.collection('userCollection');
    const user = await userCollection.findOne({ username : users[senderID].username});
    //const shoppingCart = user.shoppingCart;
    //const cart = carts[senderID];
    //console.log('cart', cart);
    if (!user){
        WA.sendMessage('User does not exist', senderID);
    }
    if (user.shoppingCart.length > 0) {
        let cartMessage = 'Your shopping cart contains:\n';
        let total = 0;
        user.shoppingCart.forEach(item => {
            cartMessage += `${item.prodname} - $${item.prodsprice}\n`;
            total += item.prodsprice;
        });
        cartMessage += `Total: $${total}\n`;
        cartMessage += 'Type "add" followed by the product ID to add more items or "checkout" to proceed.';
        WA.sendMessage(cartMessage, senderID);
    } else {
        WA.sendMessage('Your cart is empty.', senderID);
    }
}
 
async function handleCheckout(senderID) {
    const db = connectToDatabase();
    
    if (!users[senderID].username) {
        users[senderID].state = 'initial';
        WA.sendMessage('Please create an account or log in to proceed with checkout.', senderID);
        WA.sendMessage('Please create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
        return;
    }

    const userCollection = db.collection('userCollection');
    const user = await userCollection.findOne({ username : users[senderID].username});

    //const cart = carts[senderID];
    if (user.shoppingCart.length > 0) {
        let total = 0;
        user.shoppingCart.forEach(item => {
            total += item.prodsprice * item.quantityToPurchase;
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
        //WA.sendMessage('Welcome to LumiChat! We allow businesses to go digital in less than 30 minutes. We are an open e-commerce market for Small and Medium Enterprises. '
        //+ '\nPlease create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
    }
});

