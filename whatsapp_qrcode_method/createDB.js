const Business = require('./main');

//creating a fake business account for demo;
const bus1 = new Business(1, 'Business1', 'business1@gmail.com', 'test demo business created');
const user_collection = 'User';
const prod_collection = 'Product_Catalogue';

//use(business_database);

const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb+srv://Jovin:Jovin2301@lumichat.9mctvbz.mongodb.net/';

// Database Name
const dbName = bus1.busName + '_database';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  if(err) {
    console.log("Error occurred while connecting to MongoDB:", err);
    return;
  }
  console.log("Connected successfully to MongoDB");

  // Specify the database
  const db = client.db(dbName);

  // Perform operations on the database
  // For example, you can create a collection in the selected database
  db.createCollection(user_collection, function(err, result) {
    if(err) { //got error -> it will contain info bout the error, else it would be null/undefined
      console.log("Error occurred while creating collection:", err);
      return;
    }
    console.log("Collection created:", collection);
    
    // Close the connection
    client.close();
  });
});
