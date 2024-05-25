class Product{
    constructor(productID, productName, productDesc, productSellPrice, productCostPrice, productQuanToSell, productBrand, productCategory, productImage){
        this.prodid = productID;
        this.prodname = productName;
        this.proddesc = productDesc;
        this.prodsprice = productSellPrice;
        this.prodcprice = productCostPrice;
        this.prodquan = productQuanToSell;
        this.prodbrand = productBrand;
        this.prodcat = productCategory;
        this.prodImage = productImage;
    }

    //Method to calculate the total quantity left after selling a specific quantity
    quantityLeft(quantitySold){ //getting the input from the user to see how much of the product they would like to purchase
        quantityLeft = this.productquan - quantitySold; //minus from the total of products that the business would like to sell
        return quantityLeft;
    }
    

    //Method to view the total quantity left from a business perspective
    viewProductQuantityLeft(productID){
        return this.prodquan;
    }

    updateProdName(productID, newProdName){
        this.prodid = productID;
        this.prodname = newProdName; 
    }

    updateProdDesc(productID, newProdDesc){
        this.prodid = productID;
        this.proddesc = newProdDesc; 
    }

    updateProdSellPrice(productID, newProdSellPrice){
        this.prodid = productID;
        this.prodsprice = newProdSellPrice; 
    }

    updateProdCostPrice(productID, newProdCostPrice){
        this.prodid = productID;
        this.prodcprice = newProdCostPrice; 
    }

    updateProdQuan(productID, newProdQuan){
        this.prodid = productID;
        this.prodquan = newProdQuan; 
    }

    updateProdCat(productID, newProdCat){
        this.prodid = productID;
        this.prodcat = newProdCat; 
    }

    updateProdImage(productID, newProdImage){
        this.prodid = productID;
        this.prodImage = newProdImage; 
    }

    static async getAllProducts(db) {
        const productCollection = db.collection('productCollection');

        const productCount = await productCollection.countDocuments();
        if (productCount === 0) {
            return 'No products available at the moment. Please check back later.';
        }
        
        const products = await productCollection.find().toArray();
        let productMessage = 'Available Products:\n';
        
        products.forEach(product => {
        // Access fields of each document using dot notation or bracket notation
            //console.log(product);
            productMessage += `*${product.prodid}*. ${product.prodname} - $${product.prodsprice}\n`;
            productMessage += `Brand: ${product.prodbrand}\n`;
            productMessage +=  `Category: ${product.prodcat}\n`;
            productMessage += `Description: ${product.proddesc}\n\n`;
            //console.log('productMessage\n', productMessage);
        });

        productMessage += 'Please enter "Add", its respective ID and quantity that you would like to purchase i.e. Add 1, 2, to add it to cart.';
        return productMessage;
    }
}


module.exports = Product;

// export { Business, User, Product };