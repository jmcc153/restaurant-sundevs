import { CartItemType } from "@/types";
import { apiFetch } from "./api";
export const cartService = {
  getCartByUserId: async <T>(userId: string) => {
    return apiFetch<T>(`/cart/${userId}`);
  },
  addItemToCart: async <T>(
    userId: string,
    itemData: CartItemType,
    correlationId: string,
  ) => {
    return apiFetch<T>("/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, item: itemData, correlationId }),
    });
  },
  updateCartItem: async <T>(
    userId: string,
    itemData: CartItemType,
    correlationId: string,
  ) => {
    return apiFetch<T>("/cart/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, item: itemData, correlationId }),
    });
  },
  deleteCartItem: async <T>(
    userId: string,
    cartItemId: string,
    correlationId: string,
  ) => {
    return apiFetch<T>("/cart/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, cartItemId, correlationId }),
    });
  },
};
