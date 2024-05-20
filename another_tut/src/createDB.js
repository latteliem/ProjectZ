const Business = require('./businessClass');
const Product = require('./productClass'); 
const User = require('./userClass');
const { MongoClient } = require('mongodb');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');

// // Connection URI
// const uri = 'mongodb+srv://Jovin:Jovin2301@lumichat.9mctvbz.mongodb.net/${databaseName}?retryWrites=true&w=majority&ssl=true';

// Database Name
//await createBusiness('Business1', 'business1@gmail.com', 'test demo business created');

// Create a new MongoClient
//const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function configureMongo() {
  //connection URI
  const uri = 'mongodb+srv://Jovin:Jovin2301@lumichat.9mctvbz.mongodb.net/${dbName}?retryWrites=true&w=majority&ssl=true';
  const excelPath = 'C:\\NGEE ANN POLY\\YEAR 3\\CAPSTONE\\ProjectZ\\another_tut\\src\\fakeProductData.xlsx';
  
  // Create a new MongoClient
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
      // Creation of database specific to the business
      //await createBusiness('Business1', 'business1@gmail.com', 'test demo business created');
      const bus = await createBusiness('LumiChat', 'business1@gmail.com', 'test demo business created'); 
      const dbName = bus.busName;
      console.log('helllo dbName', dbName);

      // Connect to the MongoDB server
      await client.connect();
      console.log('Connected to MongoDB server');

      // Specify the database to use
      const db = client.db(dbName);
      console.log('Using database:', dbName);

      const prodCollection = db.collection('productCollection'); //need to check if productName exists alr, make primary key incremental

      //creating the products and adding them into the product catalogue specific to the business
      //await createProduct(prodCollection, 'Pet Food', 'Food for pet', 13.65, 10, 70, 'foodie', 'pet', 'foodforpet.img');

      await readExcelAndCreateProducts(excelPath, prodCollection);

      const userCollection = db.collection('userCollection'); //need to check if username exists alr, make primary key incremental
      
      //creating the user(customers) and adding them into the user database specific to the business   
      await createUser(userCollection, 'Jovin', 'jovin0123');

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
      // const highestIdDoc = await busCollection.findOne({}, { sort: { _id: -1 } });
      // const highestId = highestIdDoc ? highestIdDoc._id : 0;

      const highestIdDoc = businessList.length;
      console.log('helllllo', highestIdDoc);

      // Assign the next value to _id
      uniIdentifier = highestIdDoc + 1;
      const bus = new Business(uniIdentifier, busName, busEmail, busDesc);
      console.log('unique identifier for business1', uniIdentifier, bus.busId);
      console.log('businesslength', businessList.length);
      
      // Check if business name already exists
      const existingBus = await businessList.find(existingBus => existingBus.name === bus.name); 
      if (existingBus) {
          console.log('Business name already exists:', bus.name);
          return;
      }

      // Insert the business
      businessList.push(bus);

      console.log('Business has been created successfully');
      console.log(bus);
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


async function readExcelAndCreateProducts(excelPath, prodCollection) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(excelPath);

    // Assuming the data is in the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Extract headers (assuming headers are in the first row)
    const headers = rows[0];
    
    // Validate headers
    const requiredHeaders = ['prodid', 'prodname', 'proddesc', 'prodsprice', 'prodcprice', 'prodquan', 'prodbrand', 'prodcat', 'prodImage'];
    if (!requiredHeaders.every(header => headers.includes(header))) {
      throw new Error('Excel file does not contain all required headers');
    }

    // Extract and organize the data
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Create the product
      await createProduct(prodCollection, row[headers.indexOf('prodname')], row[headers.indexOf('proddesc')], 
      row[headers.indexOf('prodsprice')], row[headers.indexOf('prodcprice')], row[headers.indexOf('prodquan')], 
      row[headers.indexOf('prodbrand')], row[headers.indexOf('prodcat')], row[headers.indexOf('prodImage')]);
    }

    console.log('All products processed successfully!');
  } catch (err) {
    console.error('An error occurred:', err);
  }
}

async function createProduct(prodCollection, prodName, prodDesc, prodSPrice, prodCPrice, prodQuanToSell, prodBrand, prodCategory, prodImage) {
  try {
      const highestIdDoc = await prodCollection.countDocuments();

        // Assign the next value to productID
      const uniIdentifier = highestIdDoc + 1;
      
      const prod = new Product(uniIdentifier, prodName, prodDesc, prodSPrice, prodCPrice, prodQuanToSell, prodBrand, prodCategory, prodImage);
      console.log('product', prod);
      console.log('Product created successfully');
      try {
        // Check if product name already exists
        const existingProduct = await prodCollection.findOne({ prodname: prod.prodname });
        if (existingProduct) {
            console.log('Product name already exists:', prod.productName);
            return;
        }

        // Insert the product
        await prodCollection.insertOne(prod);
        console.log('product collection', prodCollection.countDocuments());
        console.log('Product inserted successfully');
        
      } catch (err) {
        console.error('Error inserting product:', err);
    }
  } catch (err) {
      console.error('Error creating product catalogue:', err);
  }
}
//module.exports = createProduct;

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
configureMongo();
module.exports = configureMongo();
module.exports = createUser();