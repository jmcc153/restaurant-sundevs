import { create } from "zustand";
import { CartItem } from "../types/cart";
import { v4 as uuidv4 } from "uuid";

interface CartState {
  items: CartItem[];
  idempotencyKey: string;
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  refreshIdempotencyKey: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  idempotencyKey: uuidv4(),

  addItem: (item) =>
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (i) =>
          i.id === item.id &&
          JSON.stringify(i.selectedModifiers) ===
            JSON.stringify(item.selectedModifiers),
      );
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex];
        existingItem.quantity += item.quantity;
        existingItem.subtotal += item.subtotal;
        return { items: updatedItems };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (cartItemId) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.cartItemId === cartItemId);

      if (existingItem && existingItem.quantity > 1) {
        return {
          items: state.items.map((i) =>
            i.cartItemId === cartItemId
              ? {
                  ...i,
                  quantity: i.quantity - 1,
                  subtotal: (i.subtotal / i.quantity) * (i.quantity - 1),
                }
              : i,
          ),
        };
      }
      return { items: state.items.filter((i) => i.cartItemId !== cartItemId) };
    }),

  /*   updateItem: (cartItemId, updatedFields) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.cartItemId === cartItemId ? { ...i, ...updatedFields } : i,
      ),
    })), */
  clearCart: () => set({ items: [] }),

  refreshIdempotencyKey: () => set({ idempotencyKey: uuidv4() }),
}));
