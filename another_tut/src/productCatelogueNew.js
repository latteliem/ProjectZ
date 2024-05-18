// const XLSX = require('xlsx');
// const { MongoClient } = require('mongodb');
// const { v4: uuidv4 } = require('uuid');
// const Product = require('./productClass'); 
// //const createProduct = require('../src/createDB');//require('./createDB');


// // Function to read the Excel file and create product objects
// async function readExcelAndCreateProducts(excelPath, prodCollection) {
//   try {
//     // Read the Excel file
//     const workbook = XLSX.readFile(excelPath);

//     // Assuming the data is in the first sheet
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];

//     // Convert the sheet to JSON
//     const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//     // Extract headers (assuming headers are in the first row)
//     const headers = rows[0];
    
//     // Validate headers
//     const requiredHeaders = ['prodid', 'prodname', 'proddesc', 'prodsprice', 'prodcprice', 'prodquan', 'prodbrand', 'prodcat', 'prodImage'];
//     if (!requiredHeaders.every(header => headers.includes(header))) {
//       throw new Error('Excel file does not contain all required headers');
//     }

//     // Extract and organize the data
//     for (let i = 1; i < rows.length; i++) {
//       const row = rows[i];
      
//       // Create the product
//       await createProduct(prodCollection, row[headers.indexOf('prodname')], row[headers.indexOf('proddesc')], 
//       row[headers.indexOf('prodsprice')], row[headers.indexOf('prodcprice')], row[headers.indexOf('prodquan')], row[headers.indexOf('prodbrand')], 
//       row[headers.indexOf('prodcat')], row[headers.indexOf('prodImage')]);
//     }

//     console.log('All products processed successfully!');
//   } catch (err) {
//     console.error('An error occurred:', err);
//   }
// }


// async function createProduct(prodCollection, prodName, prodDesc, prodSPrice, prodCPrice, prodQuanToSell, prodBrand, prodCategory, prodImage) {
//   try {
//       const highestIdDoc = await prodCollection.countDocuments();

//         // Assign the next value to productID
//       const uniIdentifier = highestIdDoc + 1;
      
//       const prod = new Product(uniIdentifier, prodName, prodDesc, prodSPrice, prodCPrice, prodQuanToSell, prodBrand, prodCategory, prodImage);
//       console.log('product', prod);
//       console.log('Product created successfully');
//       try {
//         // Check if product name already exists
//         const existingProduct = await prodCollection.findOne({ productName: prod.productName });
//         if (existingProduct) {
//             console.log('Product name already exists:', prod.productName);
//             return;
//         }

//       // Insert the product
//       await prodCollection.insertOne(prod);
//       console.log('Product inserted successfully');
//       console.log(prod);
//       } catch (err) {
//         console.error('Error inserting product:', err);
//     }
//   } catch (err) {
//       console.error('Error creating product catalogue:', err);
//   }
// }

// module.exports = readExcelAndCreateProducts;

// // // Main function to connect to the database and process the Excel file
// // async function main() {
// //   const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// //   try {
// //     await client.connect();
// //     const database = client.db('your_database_name');
// //     const prodCollection = database.collection('your_collection_name');

// //     // Path to the Excel file
// //     const excelPath = "C:\\NGEE ANN POLY\\YEAR 3\\CAPSTONE\\ProjectZ\\another_tut\\src\\fakeProductData.xlsx";

// //     // Read the Excel file and create products
// //     await readExcelAndCreateProducts(excelPath, prodCollection);
// //   } finally {
// //     await client.close();
// //   }
// // }

// // // Run the main function
// // main().catch(console.error);
