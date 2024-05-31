
import { MongoClient } from 'mongodb';

const connectToDatabase = () => {
    const uri = process.env.MONGODB_URI as string;
    const client = new MongoClient(uri);
    const dbName = 'LumiChat_database';

    return client.connect().then(() => {
        const db = client.db(dbName);
        console.log('Connected to database');
        return db;
    }).catch(err => {
        console.error(err);
        throw err;
    });
};

const findUserByUsername = (db, username) => {
    const userCollection = db.collection('userCollection');
    return userCollection.findOne({ username }).catch(err => {
        console.error('Error finding user:', err);
        throw err;
    });
};

const findProductById = (db, productId) => {
    const productCollection = db.collection('productCollection');
    return productCollection.findOne({ prodid: productId }).catch(err => {
        console.error('Error finding product:', err);
        throw err;
    });
};

const addToCart = async (user, product, quantityToPurchase) => {
    const productInCart = {
        prodid: product.prodid,
        prodname: product.prodname,
        prodsprice: product.prodsprice,
        quantityToPurchase
    };
    user.shoppingCart.push(productInCart);
};

const updateUserCart = (userCollection, user) => {
    return userCollection.updateOne(
        { userid: user.userid },
        { $set: { shoppingCart: user.shoppingCart } }
    ).catch(err => {
        console.error('Error updating cart:', err);
        throw err;
    });
};

export {
    connectToDatabase,
    findUserByUsername,
    findProductById,
    addToCart,
    updateUserCart
};
