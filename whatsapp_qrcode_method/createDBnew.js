const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb+srv://Jovin:Jovin2301@lumichat.9mctvbz.mongodb.net/${databaseName}?retryWrites=true&w=majority&ssl=true';

// Database Name
const dbName = 'myDatabase';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function configureMongo() {
    try {
        // Connect to the MongoDB server
        await client.connect();

        console.log('Connected to MongoDB server');

        // Specify the database to use
        const db = client.db(dbName);

        console.log('Using database:', dbName);

        // Perform operations with the database
        // Example: Insert a document into a collection
        const collection = db.collection('myCollection');
        await collection.insertOne({ name: 'John', age: 30 });

        console.log('Document inserted successfully');
    } catch (err) {
        console.error('Error configuring MongoDB:', err);
    } finally {
        // Close the connection
        await client.close();
    }
}

// Call the function to configure MongoDB
configureMongo();
