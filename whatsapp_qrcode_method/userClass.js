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


module.exports = User;

// export { Business, User, Product };