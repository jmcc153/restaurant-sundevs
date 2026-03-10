import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItemType } from "../types/cart";
import { v4 as uuidv4 } from "uuid";
import { cartService } from "@/services/cart";

const USER_ID = "user-1";

interface CartState {
  items: CartItemType[];
  correlationId: string;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItemType) => void;
  updateItem: (
    cartItemId: string,
    updatedFields: Partial<CartItemType>,
  ) => void;
  removeItem: (cartItemId: string) => void;
  refreshCorrelationId: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      correlationId: uuidv4(),
      loading: false,

      fetchCart: async () => {
        set({ loading: true });
        try {
          const cart = await cartService.getCartByUserId<{
            items: CartItemType[];
          }>(USER_ID);
          set({ items: cart?.items ?? [] });
        } catch (error) {
          console.error("Error al obtener el carrito:", error);
        } finally {
          set({ loading: false });
        }
      },

      addItem: (item) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) =>
              i.id === item.id &&
              JSON.stringify(i.selectedModifiers) ===
                JSON.stringify(item.selectedModifiers),
          );
          let updatedItems: CartItemType[];
          if (existingItemIndex >= 0) {
            updatedItems = [...state.items];
            const existingItem = updatedItems[existingItemIndex];
            existingItem.quantity += item.quantity;
            existingItem.subtotal += item.subtotal;
          } else {
            updatedItems = [...state.items, item];
          }

          cartService
            .addItemToCart(USER_ID, item, state.correlationId)
            .catch(console.error);

          return { items: updatedItems };
        }),

      removeItem: (cartItemId) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.cartItemId === cartItemId,
          );

          if (existingItem && existingItem.quantity > 1) {
            const updatedItem = {
              ...existingItem,
              quantity: existingItem.quantity - 1,
              subtotal:
                (existingItem.subtotal / existingItem.quantity) *
                (existingItem.quantity - 1),
            };
            cartService
              .updateCartItem(USER_ID, updatedItem, state.correlationId)
              .catch(console.error);

            return {
              items: state.items.map((i) =>
                i.cartItemId === cartItemId ? updatedItem : i,
              ),
            };
          }

          cartService
            .deleteCartItem(USER_ID, cartItemId, state.correlationId)
            .catch(console.error);
          return {
            items: state.items.filter((i) => i.cartItemId !== cartItemId),
          };
        }),

      updateItem: (cartItemId: string, updatedFields: Partial<CartItemType>) =>
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.cartItemId === cartItemId) {
              const updatedItem = { ...item, ...updatedFields };
              cartService
                .updateCartItem(USER_ID, updatedItem, state.correlationId)
                .catch(console.error);
              return updatedItem;
            }
            return item;
          });
          return { items: updatedItems };
        }),

      refreshCorrelationId: () => set({ correlationId: uuidv4() }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        correlationId: state.correlationId,
      }),
    },
  ),
);
