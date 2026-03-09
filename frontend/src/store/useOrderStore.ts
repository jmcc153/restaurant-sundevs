import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { orderService } from "@/services/order";
import { useCartStore } from "./useCartStore";

interface CheckoutState {
  isProcessing: boolean;
  error: string | null;
  processOrder: () => Promise<string | null>;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  isProcessing: false,
  error: null,

  processOrder: async () => {
    set({ isProcessing: true, error: null });
    try {
      const { correlationId, clearCart, refreshCorrelationId } =
        useCartStore.getState();

      const idempotencyKey = uuidv4();

      const data = await orderService.createOrder(
        { userId: "user-1", correlationId },
        idempotencyKey,
      );

      clearCart();
      refreshCorrelationId();

      set({ isProcessing: false });
      return data.orderId;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error fatal en checkout";
      set({ error: msg, isProcessing: false });
      return null;
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    set({ isProcessing: true, error: null });
    try {
      await orderService.updateOrderStatus(orderId, status);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al actualizar el estado de la orden:";
      set({ error: msg, isProcessing: false });
      console.error("Error al actualizar el estado de la orden:", err);
    } finally {
      set({ isProcessing: false });
    }
  },
}));
