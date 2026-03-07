import { Cart } from "../models/cart";

export const cartRepository = {
  findByUserId: async (userId: string) => {
    return await Cart.findOne({ userId }).lean();
  },

  save: async (userId: string, items: any[]) => {
    return await Cart.findOneAndUpdate(
      { userId },
      {
        userId,
        items,
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    ).lean();
  },

  clear: async (userId: string) => {
    return await Cart.findOneAndUpdate(
      { userId },
      { items: [] },
      { returnDocument: "after" },
    ).lean();
  },

  removeItem: async (userId: string, cartItemId: string) => {
    return await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { cartItemId } } },
      { returnDocument: "after" },
    ).lean();
  },
};
