const Business = require('./main');

//creating a fake business account for demo;
const bus1 = new Business(1, 'Business1', 'business1@gmail.com', 'test demo business created');
// Database Name
const databaseName = bus1.busName + '_database';
console.log(bus1.busName);
console.log(databaseName);

// const user_collection = 'User';
// const prod_collection = 'Product_Catalogue';

const { MongoClient } = require('mongodb');

// Connection URL
//const url = 'mongodb+srv://Jovin:Jovin2301@lumichat.9mctvbz.mongodb.net/';
//const url = 'mongodb+srv://Jovin:Jovin2301@cluster0.mongodb.net/myDatabase?retryWrites=true&w=majority&ssl=true';
//const url = 'mongodb+srv://Jovin:Jovin2301@cluster0.lumichat.9mctvbz.mongodb.net/myDatabase?retryWrites=true&w=majority&ssl=true';

const url = 'mongodb+srv://Jovin:Jovin2301@lumichat.9mctvbz.mongodb.net/${databaseName}?retryWrites=true&w=majority&ssl=true';

const client = new MongoClient(url);


// Main function to handle MongoDB connection and operations
async function main() {
  // Create a new MongoClient
  try{
    use(databaseName);
    client.connect(url, function(err, client) {
      if(err) {
        console.log("Error occurred while connecting to MongoDB:", err);
        return;
      }
      console.log("Connected successfully to MongoDB");
  
      // Specify the database
      const db = client.db(databaseName);
      
      // Perform operations on the database
      db.createCollection(user_collection, function(err, result) {
        if(err) { //got error -> it will contain info bout the error, else it would be null/undefined
          console.log("Error occurred while creating collection:", err);
          return;
        }
        console.log("Collection created:", user_collection);
        
        // Close the connection
        client.close();
      });

      db.createCollection(prod_collection, function(err, result) {
        if(err) { //got error -> it will contain info bout the error, else it would be null/undefined
          console.log("Error occurred while creating collection:", err);
          return;
        }
        console.log("Collection created:", prod_collection);
        
        // Close the connection
        client.close();
      });
  });

  await listDatabases(client);
  } catch (e) {
    console.error('An error occurred:', e);
  } finally {
    // Ensure the client will close when you finish/error
    await client.close();
    console.log('Connection closed');
  }
};

// Function to list the databases
async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
  console.log('Databases:');
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

// Call the main function and catch any errors
main().catch(console.error);

// Database Name
//const dbName = bus1.busName + '_database';

// Use connect method to connect to the server
// client.connect(url, function(err, client) {
//   if(err) {
//     console.log("Error occurred while connecting to MongoDB:", err);
//     return;
//   }
//   console.log("Connected successfully to MongoDB");

//   // Specify the database
//   const db = client.db(dbName);

//   // Perform operations on the database
//   // For example, you can create a collection in the selected database
//   db.createCollection(user_collection, function(err, result) {
//     if(err) { //got error -> it will contain info bout the error, else it would be null/undefined
//       console.log("Error occurred while creating collection:", err);
//       return;
//     }
//     console.log("Collection created:", collection);
    
//     // Close the connection
//     client.close();
//   });
// });


// try {
//   // Connect to the MongoDB cluster
//   await client.connect();
//   console.log('Connected to the database successfully');

//   // Make the appropriate DB calls
//   await listDatabases(client);
// } catch (e) {
//   console.error('An error occurred while connecting to the database:', e);
// } finally {
//   // Ensure the client will close when you finish/error
//   await client.close();
//   console.log('Connection closed');
// }
