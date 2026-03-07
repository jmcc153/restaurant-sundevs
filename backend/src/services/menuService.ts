import { productRepository } from "../repository/productRepository";

export const menuService = {
  getAvailableMenu: async () => {
    const products = await productRepository.getAllProducts();
    return products;
  },
};
