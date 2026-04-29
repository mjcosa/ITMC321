import Product from "../models/Product.js";

const getallProducts = async () => {
    return await Product.find();
}

const getProductById = async (id) => {
    return await Product.findById(id);
}

export default {
    getallProduct,
    createProduct
};