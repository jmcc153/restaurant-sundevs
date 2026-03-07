import { SelectedModifier } from ".";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItemModifier {
  groupName: string;
  optionName: string;
  extraPrice: number;
}

export interface OrderItem {
  cartItemId: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: OrderItemModifier[];
  subtotal: number;
}

export interface Order {
  orderId: string;
  userId: string;
  idempotencyKey: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutPayload {
  userId: string;
  correlationId: string;
}

export interface CheckoutResponse {
  orderId: string;
  status: OrderStatus;
  total: number;
}
