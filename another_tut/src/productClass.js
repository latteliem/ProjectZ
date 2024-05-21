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
        this.proid = productID;
        this.prodname = newProdName; 
    }

    updateProdDesc(productID, newProdDesc){
        this.proid = productID;
        this.proddesc = newProdDesc; 
    }

    updateProdSellPrice(productID, newProdSellPrice){
        this.proid = productID;
        this.prodsprice = newProdSellPrice; 
    }

    updateProdCostPrice(productID, newProdCostPrice){
        this.proid = productID;
        this.prodcprice = newProdCostPrice; 
    }

    updateProdQuan(productID, newProdQuan){
        this.proid = productID;
        this.prodquan = newProdQuan; 
    }

    updateProdCat(productID, newProdCat){
        this.proid = productID;
        this.prodcat = newProdCat; 
    }

    updateProdImage(productID, newProdImage){
        this.proid = productID;
        this.prodImage = newProdImage; 
    }

    async getAllProducts(productCollection) {
        if (Array.isArray(productCollection)) {
            if (productCollection.length === 0) {
                return 'No products available at the moment. Please check back later.';
            }
        
            let productMessage = 'Available Products:\n';
            products.forEach(product => {
            // Access fields of each document using dot notation or bracket notation
                productMessage += `*${product.prodid}*. ${product.prodname} - $${product.prodsprice}\n`;
                productMessage += `Description: ${product.proddesc}\n\n`;
            });
            productMessage += 'Please enter "Add" and its respective ID i.e. Add 1, to add it to cart.';
            return productMessage;
        }
    }
}

module.exports = Product;

// export { Business, User, Product };