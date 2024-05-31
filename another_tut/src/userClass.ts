import Product from "./productClass.js";

export interface CartItem extends Product {
    quantityToPurchase: number;
}

export default class User {
    userid: string;
    username: string;
    userpassword: string;
    shoppingCart: CartItem[];
    paymentid?: string;
    paymentstatus?: boolean;

    constructor(userID: string, userName: string, userPassword: string) {
        this.userid = userID;
        this.username = userName;
        this.userpassword = userPassword;
        this.shoppingCart = [];
    }

    paymentCheck(paymentID: string, paymentStatus: boolean) {
        this.paymentid = paymentID;
        this.paymentstatus = paymentStatus;
    }

    viewCart() {
        return this.shoppingCart;
    }
}

// export { Business, User, Product };
