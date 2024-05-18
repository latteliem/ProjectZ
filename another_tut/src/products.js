const products = [
    { id: 1, name: 'Cat Food', price: 10, description: 'Premium cat food for your feline friend.' },
    { id: 2, name: 'Dog Food', price: 15, description: 'Nutritious dog food for your canine companion.' },
    { id: 3, name: 'Hamster Food', price: 8, description: 'Healthy hamster food for your small pet.' }
];

function getAllProducts() {
    if (products.length === 0) {
        return 'No products available at the moment. Please check back later.';
    }
    
    let productMessage = 'Available Products:\n';
    products.forEach(product => {
        productMessage += `*${product.id}*. ${product.name} - $${product.price}\n`;
        productMessage += `Description: ${product.description}\n\n`;
    });
    productMessage += 'Please enter "Add" and its respective ID i.e. Add 1, to add it to cart.';
    return productMessage;
}

// module export two different components - the products temp DB itself,
// and the getAllProducts() function.
module.exports = {
    products,
    getAllProducts
};