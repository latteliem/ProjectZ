// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const Product = require('./productClass'); 
const User = require('./userClass');

// Start the webapp
const webApp = express();
 
// Webapp settings
webApp.use(bodyParser.urlencoded({ extended: true }));
webApp.use(bodyParser.json());

// Server Port
const PORT = process.env.PORT || 3030;
const DOMAIN = 'http://localhost:3030';


webApp.use(express.json());

// Home route
webApp.get('/', (req, res) => {
    res.send('Hello World.!');
});

function connectToDatabase(){
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try{
        const dbName = 'LumiChat_database';

        client.connect();

        const db = client.db(dbName);
        console.log('Connected to database');
        return db;
        
    } catch (err) {
        console.error(err);
    }
}

async function createProductsAndRetrieveLineItems(senderID, message) {
    try {
        users[senderID].username = message;
        const db = await connectToDatabase();
        const userCollection = db.collection('userCollection'); // User collection
        const user = await userCollection.findOne({ username: users[senderID].username }); // Finding the user
  
        if (!user || !user.shoppingCart) {
            throw new Error('User or shopping cart not found');
        }

        const productCollection = db.collection('productCollection');
        const products = await productCollection.find().toArray();

        for (const product of products) {
            try {
                const stripeProduct = await stripe.products.create({
                name: product.prodname,
                description: product.proddesc, // Include other relevant fields if needed
                metadata: {
                    mongo_id: product._id.toString(), // Optionally store the MongoDB ID in Stripe metadata
                    },
                });

                console.log(`Created Stripe product for: ${product.prodname}`);
            } catch (error) {
                console.error(`Failed to create product for: ${product.prodname}`, error);
            }
        } 
  
        const lineItems = user.shoppingCart.map(item => {
        const product = products.find(p => p.prodname === item.prodname);
        if (!product) {
          throw new Error(`Product ${item.prodname} not found in MongoDB`);
        }
        return {
          price_data: {
            currency: 'sgd', // or whatever currency you're using
            product_data: {
              name: item.prodname,
            },
            unit_amount: item.prodsprice * 100, // Stripe expects the amount in cents
          },
          quantity: item.quantityToPurchase,
        };
      });
  
      console.log('lineItems', JSON.stringify(lineItems, null, 2));
  
      return lineItems;
    } finally {
      await client.close();
    }
}


webApp.post('/create-checkout-session', async (req, res) => {
    const message = req.body.Body.toLowerCase().trim();
    const senderID = req.body.From;
    const userName = users[senderID].username; // Get the userName from the request body
    try {
        const lineItems = await retrieveData(userName);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/cancel.html`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


webApp.get('/session-status', async (req, res) => {
    const sessionId = req.query.session_id;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.send({
            status: session.payment_status,
            customer_email: session.customer_details.email,
      });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

async function main() {
    const userName = 'xuan'; // Replace with actual username
    try {
      const lineItems = await createProductsAndRetrieveLineItems(userName);
      console.log('Line Items:', lineItems);
    } catch (error) {
      console.error(error);
    }
  }
  
main().catch(console.error);


webApp.listen(PORT, () => console.log(`Running on port ${PORT}`));



// async function retrieveData(userName) {
//   const uri = 'mongodb+srv://Jovin:Jovin2301@lumichat.9mctvbz.mongodb.net/Business4_database?retryWrites=true&w=majority&ssl=true';
//   const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//   try {
//     await client.connect();

//     // Referencing the specific user's shopping cart.
//     const db = client.db('LumiChat_database'); // Refer to your specific business database
//     const userCollection = db.collection('userCollection'); // User collection
//     const user = await userCollection.findOne({ username: userName }); // Finding the user

//     if (!user || !user.shoppingCart) {
//       throw new Error('User or shopping cart not found');
//     }

//     const lineItems = user.shoppingCart.map(item => ({
//       price_data: {
//         currency: 'sgd', // or whatever currency you're using
//         name: item.prodname,
//         unit_amount: item.prodsprice, // Make sure this is in cents
//         quantity: item.quantityToPurchase,
//     }}));
//     console.log('product', lineItems);

//     return lineItems;
//   } finally {
//     await client.close();
//   }
// }
// async function createProduct_Stripe(){
//     const db = connectToDatabase();

//     const productCollection = db.collection('productCollection');
//     const products = await productCollection.find().toArray();

//     for (const product of products) {
//         try {
//             const stripeProduct = await stripe.products.create({
//             name: product.prodname,
//             description: product.proddesc, // Include other relevant fields if needed
//             metadata: {
//               mongo_id: product._id.toString(), // Optionally store the MongoDB ID in Stripe metadata
//             },
//           });
    
//             console.log(`Created Stripe product for: ${product.prodname}`);
//         } catch (error) {
//             console.error(`Failed to create product for: ${product.prodname}`, error);
//         }
//     }
// }