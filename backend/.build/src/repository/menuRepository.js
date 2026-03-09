"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRepository = void 0;
const product_1 = require("@/models/product");
exports.productRepository = {
    getAllProducts: async () => {
        return await product_1.Product.find().lean();
    },
    getProductById: async (id) => {
        return await product_1.Product.findOne({ id }).lean();
    },
};
//# sourceMappingURL=menuRepository.js.map