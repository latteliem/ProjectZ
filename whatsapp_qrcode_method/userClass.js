class User {
    constructor(userID, userName, userPassword) {
        this.userid = userID;
        this.username = userName;
        this.userpassword = userPassword;
        this.shoppingCart = [];
    };

     //creating a function to add the product and the quantity of product that the user would like to purchase
    addToCart(product, prodQuantity){
        if (prodQuantity > product.prodquan){
            console.log('You are purchasing more than what is available in store. Please click in another quantity to purchase!');
            return; // Exit the function if the quantity is not available
        }
        
        this.shoppingCart.push(product);    //adds the product that the user wants to buy to the empty shopping cart array   
        console.log('Product has been added to cart');
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