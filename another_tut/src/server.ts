import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { MongoClient, Db } from 'mongodb';
import Product from './productClass.js'; // Ensure these are correctly typed
import User from './userClass.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10'
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3030;
const DOMAIN = 'http://localhost:3030';

let db: Db;

async function connectToDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI!;
  // @ts-ignore
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
  await client.connect();
  const dbName = 'LumiChat_database';
  db = client.db(dbName);
  console.log('Connected to database');
  return db;
}

const users: { [key: string]: { username: string } } = {};

async function createProductsAndRetrieveLineItems(senderID: string, message: string) {
  try {
    users[senderID].username = message;
    const userCollection = db.collection<User>('userCollection'); // User collection
    const user = await userCollection.findOne({ username: users[senderID].username }); // Finding the user

    if (!user || !user.shoppingCart) {
      throw new Error('User or shopping cart not found');
    }

    const productCollection = db.collection('productCollection');
    const products = await productCollection.find().toArray();

    for (const product of products) {
      try {
        await stripe.products.create({
          name: product.prodname,
          description: product.proddesc,
          metadata: {
            mongo_id: product._id.toString()
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
          currency: 'sgd',
          product_data: {
            name: item.prodname,
          },
          unit_amount: item.prodsprice * 100,
        },
        quantity: item.quantityToPurchase,
      };
    });

    console.log('lineItems', JSON.stringify(lineItems, null, 2));

    return lineItems;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World.!');
});

app.post('/create-checkout-session', async (req: Request, res: Response) => {
  const message = req.body.Body.toLowerCase().trim();
  const senderID = req.body.From;
  try {
    const lineItems = await createProductsAndRetrieveLineItems(senderID, message);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/cancel.html`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/session-status', async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.send({
      status: session.payment_status,
      customer_email: session.customer_details?.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`Running on port ${PORT}`);
});

async function main() {
  const userName = 'xuan'; // Replace with actual username
  try {
    const lineItems = await createProductsAndRetrieveLineItems(userName, '');
    console.log('Line Items:', lineItems);
  } catch (error) {
    console.error(error);
  }
}

main().catch(console.error);
