const User = require('./userClass');
const { MongoClient } = require('mongodb');


async function configureUser(userName, userPassword) {
  //connection URI
  const uri = 'mongodb+srv://Jovin:Jovin2301@lumichat.9mctvbz.mongodb.net/${dbName}?retryWrites=true&w=majority&ssl=true';
    
  // Create a new MongoClient
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
      // Creation of database specific to the business
      //await createBusiness('Business1', 'business1@gmail.com', 'test demo business created');
      //const bus = await createBusiness('LumiChat', 'business1@gmail.com', 'test demo business created'); 
      const dbName = 'LumiChat_database'
      console.log('helllo dbName', dbName);

      // Connect to the MongoDB server
      await client.connect();
      console.log('Connected to MongoDB server');

      // Specify the database to use
      const db = client.db(dbName);
      console.log('Using database:', dbName);

      const userCollection = db.collection('userCollection'); //need to check if username exists alr, make primary key incremental
      
      //creating the user(customers) and adding them into the user database specific to the business   
      await createUser(userCollection, userName, userPassword);

      console.log('Document inserted successfully');
    } catch (err) {
        console.error('Error configuring MongoDB:', err);
    } finally {
        // Close the connection
        await client.close();
    }

}


async function createUser(userCollection, userName, userPassword) {
  try {
      const userCount = await userCollection.countDocuments();

      // Assign the next value to userID
      const uniIdentifier = userCount + 1;
      const user = new User(uniIdentifier, userName, userPassword);

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
        console.log(user);
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
//configureUser();
module.exports = configureUser();
module.exports = createUser();