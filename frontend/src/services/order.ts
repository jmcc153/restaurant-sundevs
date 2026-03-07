import { apiFetch } from "./api";
import { CheckoutPayload, CheckoutResponse, Order } from "@/types/order";
import { PaginatedTimeline } from "@/types/event";

export const orderService = {
  createOrder: async (payload: CheckoutPayload, idempotencyKey: string) => {
    return apiFetch<CheckoutResponse>("/orders", {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });
  },

  getOrder: async (orderId: string) => {
    return apiFetch<Order>(`/orders/${orderId}`);
  },

  getTimeline: async (
    orderId: string,
    page: number = 1,
    pageSize: number = 50,
  ) => {
    return apiFetch<PaginatedTimeline>(
      `/orders/${orderId}/timeline?page=${page}&pageSize=${pageSize}`,
    );
  },

  getTimelineByCorrelationId: async (correlationId: string) => {
    return apiFetch(`/events/correlation/${correlationId}`);
  },
};
