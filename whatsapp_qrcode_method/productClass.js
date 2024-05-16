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
        this.prodname = newProdName; 
    }

    updateProdDesc(productID, newProdDesc){
        this.proddesc = newProdDesc; 
    }

    updateProdSellPrice(productID, newProdSellPrice){
        this.prodsprice = newProdSellPrice; 
    }

    updateProdCostPrice(productID, newProdCostPrice){
        this.prodcprice = newProdCostPrice; 
    }

    updateProdQuan(productID, newProdQuan){
        this.prodquan = newProdQuan; 
    }

    updateProdCat(productID, newProdCat){
        this.prodcat = newProdCat; 
    }

    updateProdImage(productID, newProdImage){
        this.prodImage = newProdImage; 
    }
}

module.exports = Product;

// export { Business, User, Product };