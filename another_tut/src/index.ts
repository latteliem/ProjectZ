import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import twilio from 'twilio';

import { connectToDatabase, findUserByUsername, findProductById, addToCart, updateUserCart } from './databaseHelper.js';
import Business from './businessClass.js';
import Product from './productClass.js';
import User from './userClass.js';
import { products, getAllProducts } from './products.js';
import WA from './helper-function/whatsapp-send-message.js';
import { sendMessage } from './helper-function/whatsapp-send-message.js';

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
}

// Twilio phone numbers
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;
const userPhoneNumber = process.env.USER_PHONE_NUMBER!;

// Temporarily using a users list
interface UserState {
    state: string;
    username?: string;
    password?: string;
    rawPassword?: string;
    loginUsername?: string;
    loginPassword?: string;
}
const users: { [key: string]: UserState } = {};

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(bodyParser.urlencoded({ extended: true }));
webApp.use(bodyParser.json());

// Server Port
const PORT = process.env.PORT || 3000;

// Home route
webApp.get('/', (req: Request, res: Response) => {
    res.send('Hello World.!');
});

webApp.post('/whatsapp', async (req: Request, res: Response) => {
    const message = req.body.Body.toLowerCase().trim();
    const senderID = req.body.From;
    console.log(`Received message: ${message} from ${senderID}`);

    if (!users[senderID]) {
        // Send onboarding message
        users[senderID] = { state: 'initial' };
        console.log('User state is initial!');
    }  // <-- Missing closing brace added here

    handleUserState(senderID, message);

    res.status(200).send('Message processed');
});

function handleUserState(senderID: string, message: string) {
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

function handleInitial(senderID: string, message: string) {
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

function handleCreateAccount(senderID: string, message: string) {
    connectToDatabase().then(db => {
        const userCollection = db.collection('userCollection');

        userCollection.findOne({}, { sort: { userid: -1 } }).then(highestIdDoc => {
            const highestId = highestIdDoc ? highestIdDoc.userid : 0;

            const uniIdentifier = highestId + 1;

            if (!users[senderID].username) {
                users[senderID].username = message;

                userCollection.findOne({ username: users[senderID].username }).then(existingUser => {
                    if (existingUser) {
                        users[senderID].username = undefined;
                        WA.sendMessage('Username already exists. Please choose another username:', senderID);
                        return;
                    }
                    WA.sendMessage('Username set! Now enter a password:', senderID);
                }).catch(err => {
                    console.error(err);
                    WA.sendMessage('An error occurred. Please try again.', senderID);
                });
            } else if (!users[senderID].password) {
                const rawPassword = message;
                bcrypt.hash(message, 10).then(hash => {
                    users[senderID].password = hash;
                    users[senderID].rawPassword = rawPassword;

                    const newUser = new User(uniIdentifier, users[senderID].username as string, users[senderID].password as string);
                    userCollection.insertOne(newUser).then(() => {
                        users[senderID].state = 'loggedIn';
                        WA.sendMessage('Account created successfully!', senderID);
                        handleLoggedInActions(senderID, '');
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

function handleLogin(senderID: string, message: string) {
    if (!users[senderID].loginUsername) {
        users[senderID].loginUsername = message;
        WA.sendMessage('Username received! Now enter your password:', senderID);
    } else if (!users[senderID].loginPassword) {
        users[senderID].loginPassword = message;
        console.log(`User entered password: ${message}`);
        verifyLogin(senderID);
    }
}

async function verifyLogin(senderID: string) {
    const db = await connectToDatabase();
    const userCollection = db.collection('userCollection');

    const { loginUsername, loginPassword } = users[senderID];
    const user = await userCollection.findOne({ username: loginUsername });
    if (user) {
        if (loginPassword && user.userpassword) {
            const match = await bcrypt.compare(loginPassword, user.userpassword);
            if (match) {
                users[senderID].state = 'loggedIn';
                WA.sendMessage('Login successful!', senderID);
                handleLoggedInActions(senderID, '');
            } else {
                WA.sendMessage('Incorrect password. Please try again. Enter your password:', senderID);
                users[senderID].loginPassword = undefined;
                handleLogin(senderID, '');
            }
        } else {
            WA.sendMessage('An error occurred. Please try again later.', senderID);
        }
    } else {
        WA.sendMessage('Username not found. Please enter your username again:', senderID);
        users[senderID].loginUsername = undefined;
        handleLogin(senderID, '');
    }
}

async function handleViewProducts(senderID: string) {
    const db = await connectToDatabase();
    const productMessage = await Product.getAllProducts(db);
    WA.sendMessage(productMessage, senderID);
    users[senderID].state = 'viewProducts';
}

function handleLoggedInActions(senderID: string, message: string) {
    if (message === 'view products' || message === '1') {
        handleViewProducts(senderID);
    } else if (message === 'view cart' || message === '2') {
        handleViewCart(senderID);
    } else if (message === 'checkout' || message === '3') {
        handleCheckout(senderID);
    } else if (users[senderID].state === 'viewProducts' && !message.startsWith('add')) {
        WA.sendMessage('To add a product, please use the format "add [productId]". For example, "add 1".', senderID);
    } else if (message.startsWith('add')) {
        handleAddProduct(senderID, message);
    } else {
        WA.sendMessage(
            'Welcome to our store! Here are some commands you can use:\n1. View Products\n2. View Cart\n3. Checkout\n',
            senderID
        );
    }
}

function handleAddProduct(senderID: string, message: string) {
    connectToDatabase().then(db => {
        if (!users[senderID] || !users[senderID].username) {
            users[senderID] = { state: 'initial' };
            WA.sendMessage('Please create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
            return;
        }

        findUserByUsername(db, users[senderID].username).then(userRecord => {
            if (!userRecord) {
                WA.sendMessage('Username not found. Please enter your username again:', senderID);
                users[senderID].loginUsername = undefined;
                return handleLogin(senderID, '');
            }

            const parts = message.split(' ');
            if (parts.length < 2 || isNaN(parseInt(parts[1]))) {
                WA.sendMessage('Invalid format. Please use "add [productId]". For example, "add 1".', senderID);
                return;
            }

            const productId = parseInt(parts[1]);
            const quantityToPurchase = 1;

            findProductById(db, productId).then(product => {
                if (product) {
                    if (quantityToPurchase <= product.prodquan) {
                        addToCart(userRecord, product, quantityToPurchase).then(() => {
                            const userCollection = db.collection('userCollection');
                            updateUserCart(userCollection, userRecord).then(() => {
                                WA.sendMessage(`${product.prodname} has been added to your cart. Type 'view cart' to see your cart or 'checkout' to proceed to checkout.`, senderID);
                            }).catch(err => {
                                WA.sendMessage('An error occurred while updating the cart. Please try again.', senderID);
                            });
                        });
                    } else {
                        WA.sendMessage(`Insufficient stock for purchase, we only have ${product.prodquan} left!`, senderID);
                    }
                } else {
                    WA.sendMessage('Product not found. Please enter a valid product ID or name.', senderID);
                }
            }).catch(err => {
                WA.sendMessage('An error occurred. Please try again.', senderID);
            });
        }).catch(err => {
            WA.sendMessage('An error occurred. Please try again.', senderID);
        });
    }).catch(err => {
        WA.sendMessage('An error occurred. Please try again.', senderID);
    });
}

async function handleViewCart(senderID: string) {
    const db = await connectToDatabase();

    if (!users[senderID].username) {
        users[senderID].state = 'initial';
        WA.sendMessage('Please create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
        return;
    }

    const userCollection = db.collection('userCollection');
    const user = await userCollection.findOne({ username: users[senderID].username });
    if (!user) {
        WA.sendMessage('User does not exist', senderID);
        return;
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

async function handleCheckout(senderID: string) {
    const db = await connectToDatabase();

    if (!users[senderID].username) {
        users[senderID].state = 'initial';
        WA.sendMessage('Please create an account or log in to proceed with checkout.', senderID);
        WA.sendMessage('Please create an account, log in, or view products. (Type "create account", "login", or "view products")', senderID);
        return;
    }

    const userCollection = db.collection('userCollection');
    const user = await userCollection.findOne({ username: users[senderID].username });
    
    if (!user) {
        WA.sendMessage('User does not exist', senderID);
        return;
    }

    if (user.shoppingCart.length > 0) {
        let total = 0;
        user.shoppingCart.forEach(item => {
            total += item.prodsprice * item.quantityToPurchase;
        });
        WA.sendMessage(`Your total is $${total}. Do you confirm the purchase? (yes/no)`, senderID);
        users[senderID].state = 'confirmPurchase';
    } else {
        WA.sendMessage('Your cart is empty. Add items to your cart before checking out.', senderID);
        users[senderID].state = 'loggedIn';
    }
}

function handleConfirmPurchase(senderID: string, message: string) {
    if (message === 'yes') {
        WA.sendMessage('Thank you for your purchase! Your order is being processed.', senderID);
        // delete carts[senderID];
        users[senderID].state = 'loggedIn';
        handleLoggedInActions(senderID, '');
    } else if (message === 'no') {
        WA.sendMessage('Purchase canceled. You can continue to add items to your cart or proceed to checkout again.', senderID);
        users[senderID].state = 'loggedIn';
        handleLoggedInActions(senderID, '');
    } else {
        WA.sendMessage('Please respond with "yes" or "no" to confirm your purchase.', senderID);
    }
}

// Start the server
webApp.listen(PORT, async () => {
    console.log(`Server is up and running at ${PORT}`);
    
    // Call the sendMessage function when the server starts
    try {
        const userPhoneNumber = process.env.USER_PHONE_NUMBER!; // Ensure this environment variable is set
        sendMessage('Welcome to LumiChat! We allow businesses to go digital in'+
        'less than 30 minutes. We are an open e-commerce market for Small and Medium Enterprises.'+ 
       'Please create an account, log in, or view products. (Type "create account", "login", or "view products")'
       , userPhoneNumber);
        console.log('Initial message sent successfully');
    } catch (error) {
        console.error('Error sending initial message:', error);
    }
});