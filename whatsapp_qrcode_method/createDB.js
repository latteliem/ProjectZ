const Business = require('./class');
const Product = require('./class'); 
const User = require('./class');
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb+srv://Jovin:Jovin2301@lumichat.9mctvbz.mongodb.net/${databaseName}?retryWrites=true&w=majority&ssl=true';

// Database Name
//await createBusiness('Business1', 'business1@gmail.com', 'test demo business created');


// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function configureMongo() {
  try {
        // Creation of database specific to the business
        //await createBusiness('Business1', 'business1@gmail.com', 'test demo business created');
        const bus = createBusiness('Business2', 'business1@gmail.com', 'test demo business created');
        const dbName = bus.busName;
        // Connect to the MongoDB server
        await client.connect();

        console.log('Connected to MongoDB server');

        // Specify the database to use
        const db = client.db(dbName);

        console.log('Using database:', dbName);

        const prodCollection = db.collection('productCollection'); //need to check if productName exists alr, make primary key incremental

        //creating the products and adding them into the product catalogue specific to the business
        await createProduct(prodCollection, 'Pet Food', 'Food for pet', 13.65, 10, 70, 'foodie', 'pet', 'foodforpet.img');
        //await insertProduct(client, dbName, prod1);

        const userCollection = db.collection('userCollection'); //need to check if username exists alr, make primary key incremental
        
        //creating the user(customers) and adding them into the user database specific to the business   
        await createUser(userCollection, 'John', 'john123','johnnnn@gmail.com');
        //await insertUser(client, dbName, user1);

        console.log('Document inserted successfully');
    } catch (err) {
        console.error('Error configuring MongoDB:', err);
    } finally {
        // Close the connection
        await client.close();
    }

}

const businessList = [];
async function createBusiness(busName, busEmail, busDesc) {
  try {
      const highestIdDoc = await busCollection.findOne({}, { sort: { _id: -1 } });
      const highestId = highestIdDoc ? highestIdDoc._id : 0;

      // Assign the next value to _id
      uniIdentifier = highestId + 1;
      const bus = new Business(uniIdentifier, busName, busEmail, busDesc);

      // Check if business name already exists
      const existingBus = await businessList.find(existingBus => existingBus.name === bus.name); 
      if (existingBus) {
          console.log('Business name already exists:', bus.name);
          return;
      }

      // Insert the business
      businessList.push(bus);

      console.log('Business has been created successfully');
      return bus;
  } catch (err) {
      console.error('Error creating business:', err);
  }
}

// async function checkBusinessExist(business) {
//   try {
//       const businessList = [];

//       // Check if business name already exists
//       const existingBus = await businessList.find(existingBus => existingBus.name === business.name); //assumes that they can create multiple bots
//       if (existingBus) {
//           console.log('Business name already exists:', business.name);
//           return;
//       }

//       // Insert the business
//       businessList.push(business);
//       console.log('Business inserted successfully');
//   } catch (err) {
//       console.error('Error inserting business:', err);
//   }
// }

async function createProduct(prodCollection, prodName, prodDesc, prodSPrice, prodCPrice, prodQuanToSell, prodBrand, prodCategory, prodImage) {
  try {
      const highestIdDoc = await prodCollection.findOne({}, { sort: { _id: -1 } });
      const highestId = highestIdDoc ? highestIdDoc._id : 0;

      // Assign the next value to _id
      uniIdentifier = highestId + 1;
      const prod = new Product(uniIdentifier, prodName, prodDesc, prodSPrice, prodCPrice, prodQuanToSell, prodBrand, prodCategory, prodImage);

      console.log('Product created successfully');
      try {
        // Check if product name already exists
        const existingProduct = await prodCollection.findOne({ productName: product.productName });
        if (existingProduct) {
            console.log('Product name already exists:', product.productName);
            return;
        }

      // Insert the product
      await prodCollection.insertOne(product);
      console.log('Product inserted successfully');
      } catch (err) {
        console.error('Error inserting product:', err);
    }
  } catch (err) {
      console.error('Error creating product catalogue:', err);
  }
}

// async function insertProduct(client, dbName, product) {
//   try {
//       const db = client.db(dbName);
//       const prodCollection = db.collection('productCollection');

//       // Check if product name already exists
//       const existingProduct = await prodCollection.findOne({ productName: product.productName });
//       if (existingProduct) {
//           console.log('Product name already exists:', product.productName);
//           return;
//       }

//       // Insert the product
//       await prodCollection.insertOne(product);
//       console.log('Product inserted successfully');
//   } catch (err) {
//       console.error('Error inserting product:', err);
//   }
// }

async function createUser(userCollection, userName, userPassword, userEmail) {
  try {
      const highestIdDoc = await userCollection.findOne({}, { sort: { _id: -1 } });
      const highestId = highestIdDoc ? highestIdDoc._id : 0;

      // Assign the next value to _id
      uniIdentifier = highestId + 1;
      const user = new User(uniIdentifier, userName, userPassword, userEmail);

      console.log('User account created successfully');
      try {
        // Check if username already exists
        const existingUser = await userCollection.findOne({ username: user.username });
        if (existingUser) {
            console.log('Username already exists:', user.username);
            return;
        }
  
        // Insert the user
        await userCollection.insertOne(user);
        console.log('User inserted successfully');

      } catch (err) {
          console.error('Error inserting user:', err);
      }
  } catch (err) {
      console.error('Error creating a user account:', err);
  }
}

// async function insertUser(client, dbName, user) {
//   try {
//       const db = client.db(dbName);
//       const userCollection = db.collection('userCollection');

//       // Check if username already exists
//       const existingUser = await userCollection.findOne({ username: user.username });
//       if (existingUser) {
//           console.log('Username already exists:', user.username);
//           return;
//       }

//       // Insert the user
//       await userCollection.insertOne(user);
//       console.log('User inserted successfully');
//   } catch (err) {
//       console.error('Error inserting user:', err);
//   }
// }

// Call the function to configure MongoDB
configureMongo();