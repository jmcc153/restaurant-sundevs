import { cartRepository } from "@/repository/cartRepository";
import { eventRepository } from "@/repository/eventRepository";
import { CartItemType } from "@/types/cart";

export const cartService = {
  getCartByUserId: async (userId: string) => {
    return await cartRepository.findByUserId(userId);
  },

  addItemToCart: async (
    userId: string,
    itemData: CartItemType,
    correlationId: string,
  ) => {
    const currentCart = await cartRepository.findByUserId(userId);
    const existingItems = currentCart ? currentCart.items : [];
    const updatedItems = [...existingItems, itemData];

    const updatedCart = await cartRepository.save(userId, updatedItems);
    await eventRepository.save({
      userId,
      type: "CART_ITEM_ADDED",
      correlationId,
      payload: { item: itemData },
      source: "web",
    });
    return updatedCart;
  },

  updateCartItem: async (
    userId: string,
    itemData: CartItemType,
    correlationId: string,
  ) => {
    const currentCart = await cartRepository.findByUserId(userId);
    const existingItems = currentCart ? currentCart.items : [];
    const updatedItems = existingItems.map((item) =>
      item.cartItemId === itemData.cartItemId ? itemData : item,
    );
    const updatedCart = await cartRepository.save(userId, updatedItems);
    await eventRepository.save({
      userId,
      type: "CART_ITEM_UPDATED",
      correlationId,
      payload: { item: itemData },
      source: "web",
    });
    return updatedCart;
  },

  removeCartItem: async (
    userId: string,
    cartItemId: string,
    correlationId: string,
  ) => {
    const updatedCart = await cartRepository.removeItem(userId, cartItemId);
    await eventRepository.save({
      userId,
      type: "CART_ITEM_REMOVED",
      correlationId,
      payload: { cartItemId },
      source: "web",
    });
    return updatedCart;
  },
};
