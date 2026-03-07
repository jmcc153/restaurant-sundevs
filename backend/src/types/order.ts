export interface OrderItemModifier {
  groupName: string;
  optionName: string;
  extraPrice: number;
}

export interface OrderItemType {
  cartItemId: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: OrderItemModifier[];
  subtotal: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderType {
  orderId: string;
  userId: string;
  idempotencyKey: string;
  status: OrderStatus;
  items: OrderItemType[];
  total: number;
}
