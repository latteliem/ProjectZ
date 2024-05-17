const stripe = require('stripe')('sk_test_Ou1w6LVt3zmVipDVJsvMeQsc');
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

//1. checking out --> have a check out session
//2. read the database to obtain the shopping cart details
//3. make the payment
//4. send cfmation email/letter/invoice

//POV from the user (customer), they make chose what they want to purchase, then they are trying to make a payment for their items
app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: lineItems,
      mode: 'payment',
      return_url: `${YOUR_DOMAIN}/return.html?session_id={CHECKOUT_SESSION_ID}`,
    });
  
    res.send({clientSecret: session.client_secret});
  });
  
  app.get('/session-status', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  
    res.send({
      status: session.status,
      customer_email: session.customer_details.email
    });
  });

async function retrieveData(){
    const uri = 'mongodb+srv://Jovin:Jovin2301@lumichat.9mctvbz.mongodb.net/${dbName}?retryWrites=true&w=majority&ssl=true'
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try{
        await client.connect();
        
        //refering back to the user's shopping cart.
        const database = client.db('Business4_database'); //i need to retrive the specific business. 
        const userCollection = database.collection('userCollection'); //second, i need to find the specific user collection
        const user = await userCollection.findOne({userName:'userName'}); //finding the user to have access to the shopping cart

        const shoppingCart = [];
        const lineItems = user.shoppingCart.map(item => {
            const product = productMap[item.productName];
            if (!product) {
              throw new Error(`Product ${item.productName} not found in database`);
            }
            return {
                name: product.prodname,
                price: product.prodsprice,
                quantity: item.prodquan 
            };
          });
        
    }finally{
        await client.close();
    }
        
}

retrieveData().catch(console.error);