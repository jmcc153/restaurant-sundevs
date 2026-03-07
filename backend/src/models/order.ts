import { Schema, model } from "mongoose";

const OrderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof OrderStatuses)[number];

const OrderItemSchema = new Schema(
  {
    cartItemId: { type: String, required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    modifiers: [
      {
        groupName: { type: String, required: true },
        optionName: { type: String, required: true },
        extraPrice: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    correlationId: { type: String, required: true, index: true },
    idempotencyKey: { type: String, required: true, unique: true },
    status: {
      type: String,
      required: true,
      enum: OrderStatuses,
      default: "PENDING",
    },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Order = model("Order", OrderSchema);
