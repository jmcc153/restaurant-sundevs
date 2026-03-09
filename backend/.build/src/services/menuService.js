"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuService = void 0;
const menuRepository_1 = require("../repository/menuRepository");
exports.menuService = {
    getAvailableMenu: async () => {
        const products = await menuRepository_1.productRepository.getAllProducts();
        return products;
    },
};
//# sourceMappingURL=menuService.js.map