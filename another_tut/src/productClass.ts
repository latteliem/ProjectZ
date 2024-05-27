import { Db } from 'mongodb';

export default class Product {
    prodid: number;
    prodname: string;
    proddesc: string;
    prodsprice: number;
    prodcprice: number;
    prodquan: number;
    prodbrand: string;
    prodcat: string;
    prodImage: string;

    constructor(
        productID: number,
        productName: string,
        productDesc: string,
        productSellPrice: number,
        productCostPrice: number,
        productQuanToSell: number,
        productBrand: string,
        productCategory: string,
        productImage: string
    ) {
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

    // Method to calculate the total quantity left after selling a specific quantity
    quantityLeft(quantitySold: number): number {
        const quantityLeft = this.prodquan - quantitySold;
        return quantityLeft;
    }

    // Method to view the total quantity left from a business perspective
    viewProductQuantityLeft(): number {
        return this.prodquan;
    }

    updateProdName(newProdName: string): void {
        this.prodname = newProdName;
    }

    updateProdDesc(newProdDesc: string): void {
        this.proddesc = newProdDesc;
    }

    updateProdSellPrice(newProdSellPrice: number): void {
        this.prodsprice = newProdSellPrice;
    }

    updateProdCostPrice(newProdCostPrice: number): void {
        this.prodcprice = newProdCostPrice;
    }

    updateProdQuan(newProdQuan: number): void {
        this.prodquan = newProdQuan;
    }

    updateProdCat(newProdCat: string): void {
        this.prodcat = newProdCat;
    }

    updateProdImage(newProdImage: string): void {
        this.prodImage = newProdImage;
    }

    static async getAllProducts(db: Db): Promise<string> {
        const productCollection = db.collection('productCollection');

        const productCount = await productCollection.countDocuments();
        if (productCount === 0) {
            return 'No products available at the moment. Please check back later.';
        }

        const products = await productCollection.find().toArray();
        let productMessage = 'Available Products:\n';

        products.forEach(product => {
            productMessage += `*${product.prodid}*. ${product.prodname} - $${product.prodsprice}\n`;
            productMessage += `Brand: ${product.prodbrand}\n`;
            productMessage += `Category: ${product.prodcat}\n`;
            productMessage += `Description: ${product.proddesc}\n\n`;
        });

        productMessage += 'Please enter "Add", its respective ID and quantity that you would like to purchase i.e. Add 1, 2, to add it to cart.';
        return productMessage;
    }
}
