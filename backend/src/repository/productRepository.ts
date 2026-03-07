import { Product } from "@/models/product";

export const productRepository = {
  getAllProducts: async () => {
    return await Product.find().lean();
  },
  getProductById: async (id: string) => {
    return await Product.findOne({ id }).lean();
  },
};
