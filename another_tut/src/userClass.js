class User {
    constructor(userID, userName, userPassword) {
        this.userid = userID;
        this.username = userName;
        this.userpassword = userPassword;
        this.shoppingCart = [];
    };

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