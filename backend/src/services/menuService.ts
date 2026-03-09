import { productRepository } from "../repository/menuRepository";

export const menuService = {
  getAvailableMenu: async () => {
    const products = await productRepository.getAllProducts();
    return products;
  },
};
