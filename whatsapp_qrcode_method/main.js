class Business{
    constructor(busID, busName, busEmail, busDesc){
        this.busid = busID;
        this.busname = busName;
        this.busemail = busEmail;
        this.busdesc = busDesc;
    }
}

module.exports = Business;

class User {
    constructor(userID, userName, userPassword) {
        this.userid = userID;
        this.username = userName;
        this.userpassword = userPassword;
        this.shoppingCart = [];
    };

    addToCart(prodID, prodName, prodSellPrice, prodQuantity){
        const productInCart = { //creating a function to add the product and the quantity of product that the user would like to purchase
            prodid: prodID,
            prodname: prodName,
            prodsellprice: prodSellPrice,
            prodQuantity: prodQuantity
        };
        this.shoppingCart.push(productInCart);    //adds the product that the user wants to buy to the empty shopping cart array    
    }

    paymentCheck(paymentID, paymentStatus){
        this.paymentid = paymentID;
        this.paymentstatus = paymentStatus;
    }

    viewCart(){
        return this.shoppingCart;
    }
}

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


